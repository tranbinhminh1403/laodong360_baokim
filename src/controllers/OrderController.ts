import { Request, Response } from 'express';
import axios from 'axios';
import { generateJWTToken } from '../utils/jwt';
import dotenv from 'dotenv';
import * as OrderRepository from '../repositories/OrderRepository';
import { verifyWebhook } from '../utils/webhookVerify';

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
        if (!SECRET_KEY) {
            throw new Error('SECRET_KEY is not configured');
        }

        // Log the raw webhook data
        console.log('=== Webhook Data Received ===');
        console.log('Headers:', req.headers);
        console.log('Body:', JSON.stringify(req.body, null, 2));
        console.log('========================');

        const webhookData = JSON.stringify(req.body);
        const isValid = verifyWebhook(SECRET_KEY, webhookData);

        if (!isValid) {
            console.log('❌ Invalid webhook signature');
            return res.status(401).json({
                success: false,
                error: 'Invalid webhook signature'
            });
        }

        // Log the verified webhook data
        console.log('✅ Webhook signature verified');
        console.log('Transaction Status:', req.body.txn?.stat);
        console.log('Order ID:', req.body.order?.mrc_order_id);
        console.log('Amount:', req.body.txn?.total_amount);

        return res.status(200).json({
            success: true,
            message: 'Webhook processed successfully'
        });
    } catch (error: any) {
        console.error('Webhook processing error:', error.message);
        return res.status(500).json({
            success: false,
            error: error.message
        });
    }
}; 