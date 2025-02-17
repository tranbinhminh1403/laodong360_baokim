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
            webhooks: URL_WEBHOOK,
            url_success: URL_SUCCESS,
            url_cancel: URL_CANCEL,
            url_detail: URL_DETAIL,
            lang: req.body.lang || 'vi'
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

        // Get webhook data as string
        const webhookData = req.body;

        console.log('\n=== BAOKIM WEBHOOK DATA RECEIVED ===');
        console.log('\nRaw Webhook Data:');
        console.log(webhookData);

        // Verify signature
        const isValid = verifyWebhook(SECRET_KEY, webhookData);
        if (!isValid) {
            console.log('❌ Invalid webhook signature');
            return res.status(200).json({
                err_code: "1",
                message: "Invalid signature"
            });
        }

        // Parse the string data
        const parsedData: WebhookPayload = JSON.parse(webhookData);

        // Process webhook
        const success = await webhookService.processWebhook(parsedData);
        
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
    console.log('log này do call api không lúc ', getVietnamTime());
    // console.log("req.body \n", req.body);
    try {
        const webhookData = JSON.stringify(req.body);
        // const secretKey = SECRET_KEY;

        // Lấy signature từ webhook data
        const receivedSignature = req.body.sign;

        // Tạo dataHash bằng cách cắt bỏ phần signature giống Java
        const dataHash = webhookData.substring(0, webhookData.lastIndexOf('}')) + '}';

        // Tạo signature mới sử dụng HMAC-SHA256
        const calculatedSignature = crypto
            .createHmac('sha256', "SECRET_KEY")
            .update(dataHash)
            .digest('hex')
            .toLowerCase();

        // So sánh signature
        const isValid = receivedSignature === calculatedSignature;
        console.log("isValid", isValid);

        console.log({
            receivedSignature,
            calculatedSignature,
            isValid
        });

        return res.status(200).json({
            success: true,
            data: {
                receivedSignature,
                calculatedSignature,
                isValid
            }
        });

    } catch (error: any) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
}; 