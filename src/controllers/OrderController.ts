import { Request, Response } from 'express';
import axios from 'axios';
import { generateJWTToken } from '../utils/jwt';
import dotenv from 'dotenv';

dotenv.config();

const API_KEY = process.env.API_KEY;
const SECRET_KEY = process.env.SECRET_KEY;
const MERCHANT_ID = process.env.MERCHANT_ID;
const API_URL = 'https://dev-api.baokim.vn/payment/api/v5/order/send';

export const sendOrder = async (req: Request, res: Response) => {
    try {
        if (!API_KEY || !SECRET_KEY || !MERCHANT_ID) {
            throw new Error('Thiếu thông tin cấu hình API_KEY, SECRET_KEY hoặc MERCHANT_ID');
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
            total_amount: parseInt(req.body.total_amount) || 24000,
            description: req.body.description || 'Test order payment',
            url_success: req.body.url_success || 'https://your-website.com/success',
            url_cancel: req.body.url_cancel || 'https://your-website.com/cancel',
            url_detail: req.body.url_detail || 'https://your-website.com/detail',
            lang: req.body.lang || 'vi',
            // bpm_id: parseInt(req.body.bpm_id) || 1,
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

        return res.status(200).json({
            success: true,
            data: response.data,
            order_id: mrc_order_id,
            request_data: orderData
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