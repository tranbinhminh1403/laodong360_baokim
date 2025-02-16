import { Request, Response } from 'express';
import axios from 'axios';
import { generateJWTToken } from '../utils/jwt';
import dotenv from 'dotenv';
import * as OrderRepository from '../repositories/OrderRepository';
import { verifyWebhook } from '../utils/webhookVerify';
import { WebhookService } from '../services/webhook.service';
import { WebhookPayload } from '../types/webhook.types';
import crypto from 'crypto';
import { getVietnamTime, getFormattedVietnamTime } from '../utils/dateTime';

dotenv.config();

const API_KEY = process.env.API_KEY;
const SECRET_KEY = process.env.SECRET_KEY;
const MERCHANT_ID = process.env.MERCHANT_ID;
const API_URL = 'https://dev-api.baokim.vn/payment/api/v5/order/send';

// Lấy URLs từ biến môi trường
const URL_SUCCESS = process.env.PAYMENT_URL_SUCCESS;
const URL_CANCEL = process.env.PAYMENT_URL_CANCEL;
const URL_DETAIL = process.env.PAYMENT_URL_DETAIL;
const URL_WEBHOOK = process.env.PAYMENT_URL_WEBHOOK;
console.log(URL_WEBHOOK);

const webhookService = new WebhookService();

export const sendOrder = async (req: Request, res: Response) => {
    try {
        if (!API_KEY || !SECRET_KEY || !MERCHANT_ID || !URL_SUCCESS || !URL_CANCEL || !URL_DETAIL) {
            throw new Error('Thiếu thông tin cấu hình trong biến môi trường');
        }

        // Tạo JWT token
        const jwtToken = generateJWTToken(API_KEY, SECRET_KEY);

        // Tạo mã đơn hàng unique dựa trên timestamp
        const timestamp = Math.floor(Date.now() / 1000);
        const mrc_order_id = `ORDER_${timestamp}`;

        // Tạo payload cho request
        const orderData = {
            merchant_id: parseInt(MERCHANT_ID),
            mrc_order_id: mrc_order_id,
            total_amount: parseInt(req.body.price),
            description: `Thanh toán đơn hàng ${mrc_order_id}`,
            webhook_url: URL_WEBHOOK,
            url_success: URL_SUCCESS,
            url_cancel: URL_CANCEL,
            url_detail: URL_DETAIL,
            lang: req.body.lang || 'vi',
            customer_email: req.body.customer_email || 'example@email.com',
            customer_phone: req.body.customer_phone || '0123456789',
            customer_name: req.body.customer_name || 'Nguyen Van A'
        };

        console.log(orderData);
        console.log(getVietnamTime());

        // Gọi API Bao Kim
        const response = await axios.post(API_URL, orderData, {
            headers: {
                'Content-Type': 'application/json',
                'jwt': `Bearer ${jwtToken}`
            }
        });

        // Nếu API call thành công, lưu order vào DB
        if (response.data.data.order_id) {
            await OrderRepository.createOrder({
                ...req.body,
                mrc_order_id,
                order_id: response.data.data.order_id,
                status: "Pending"
            });
        }

        return res.status(200).json({
            success: true,
            data: {
                order_id: response.data.data.order_id,
                redirect_url: response.data.data.redirect_url,
                payment_url: response.data.data.payment_url,
            }
        });

    } catch (error: any) {
        console.error('Lỗi khi tạo đơn hàng:', error.message);
        return res.status(500).json({
            success: false,
            error: error.message || 'Có lỗi xảy ra khi tạo đơn hàng',
            error_response: error.response?.data
        });
    }
};

export const handleWebhook = async (req: Request, res: Response) => {
    try {
        if (!process.env.SECRET_KEY) {
            throw new Error('SECRET_KEY is not configured');
        }

        console.log('\n=== BAOKIM WEBHOOK DATA RECEIVED ===');
        console.log('\n1. Request Headers:');
        console.log(JSON.stringify(req.headers, null, 2));

        console.log('\n2. Order Information:');
        console.log('Order ID:', req.body.order?.mrc_order_id);
        console.log('Total Amount:', req.body.order?.total_amount);
        console.log('Status:', req.body.order?.stat);
        console.log('Customer:', {
            name: req.body.order?.customer_name,
            email: req.body.order?.customer_email,
            phone: req.body.order?.customer_phone
        });

        console.log('\n3. Transaction Details:');
        console.log('Transaction ID:', req.body.txn?.id);
        console.log('Reference ID:', req.body.txn?.reference_id);
        console.log('Status:', req.body.txn?.stat);
        console.log('Completed At:', req.body.txn?.completed_at);
        console.log('Bank Reference:', req.body.txn?.bank_ref_no);

        if (req.body.dataToken) {
            console.log('\n4. Card Token Information:');
            console.log('Card Type:', req.body.dataToken[0]?.card_type);
            console.log('Bank Code:', req.body.dataToken[0]?.bank_code);
            // Don't log full card details for security
        }

        console.log('\n5. Raw Webhook Data:');
        console.log(JSON.stringify(req.body, null, 2));
        console.log('\n=====================================\n');

        const webhookData = req.body as WebhookPayload;
        
        // 1. Verify signature
        const isValid = verifyWebhook(process.env.SECRET_KEY, webhookData);
        if (!isValid) {
            console.log('❌ Signature Verification Failed');
            return res.status(200).json({
                err_code: "1",
                message: "Invalid signature"
            });
        }

        console.log('✅ Signature Verified Successfully');
        
        // 2. Process webhook
        const success = await webhookService.processWebhook(webhookData);
        
        // 3. Return appropriate response
        if (success) {
            console.log('✅ Webhook Processed Successfully');
            return res.status(200).json({
                err_code: "0",
                message: "Payment processed successfully"
            });
        } else {
            console.log('❌ Webhook Processing Failed');
            return res.status(200).json({
                err_code: "1",
                message: "Payment processing failed"
            });
        }

    } catch (error: any) {
        console.error('❌ Webhook Error:', error.message);
        return res.status(200).json({
            err_code: "1",
            message: error.message.substring(0, 255)
        });
    }
};

export const testVerifyWebhook = async (req: Request, res: Response) => {
    try {
        const { secretKey, webhookData } = req.body;
        
        if (!secretKey || !webhookData) {
            return res.status(400).json({
                success: false,
                message: 'Thiếu secretKey hoặc webhookData'
            });
        }

        // Lấy signature từ webhook data
        const webhookObj = JSON.parse(webhookData);
        const receivedSignature = webhookObj.sign;

        // Tạo dataHash bằng cách cắt bỏ phần signature
        const lastBraceIndex = webhookData.lastIndexOf('}');
        const dataHash = webhookData.substring(0, lastBraceIndex + 1);

        // Tạo signature mới
        const calculatedSignature = crypto
            .createHmac('sha256', secretKey)
            .update(dataHash)
            .digest('hex')
            .toLowerCase();

        return res.status(200).json({
            success: true,
            data: {
                receivedSignature,
                calculatedSignature,
                isValid: calculatedSignature === receivedSignature
            }
        });

    } catch (error: any) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
}; 