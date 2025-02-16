import * as OrderRepository from "../repositories/OrderRepository";
import { generateOrderReference } from '../utils/GenOrderReference';
import { createPaymentOrder } from '../services/PaymentService';
import { ServiceResponse } from "../types/ServiceResponse";
import { Orders } from "../entities/Orders";
import { sendNewOrderNotification } from './EmailService';
// import { sendOrderCreatedSuccess } from './EmailService';

export const createOrders = async (orderData: any): Promise<ServiceResponse> => {
    const startTime = Date.now();
    console.log(`[${new Date().toISOString()}] Start create order process`);
    
    try {
        // Bước 1: Tạo orderReference
        const genRefStart = Date.now();
        const orderReference = await generateUniqueOrderReference();
        console.log(`[${new Date().toISOString()}] Generate unique orderReference took ${Date.now() - genRefStart}ms`);

        // Bước 2: Thực hiện song song payment order và lưu order
        const operationsStart = Date.now();
        const [paymentResult, savedOrder] = await Promise.all([
            createPaymentOrder(
                orderReference, 
                Math.floor(orderData.price).toString(),
                orderData.ip_address
            ),
            OrderRepository.createOrder({
                ...orderData,
                orderReference,
                time: new Date().toISOString(),
                status: "Pending"
            })
        ]);

        if ('error_code' in paymentResult && paymentResult.error_code !== '00') {
            // Nếu payment thất bại, cập nhật status order thành Failed
            await OrderRepository.updateOrderStatus(savedOrder.id, 'Failed');
            throw new Error(paymentResult.message || 'Payment creation failed');
        }

        // Gửi email không chặn luồng chính
        sendNewOrderNotification(savedOrder).catch(error => {
            console.error('Send new order notification email failed:', error);
        });

        const response = {
            success: true,
            data: {
                ...savedOrder,
                payment_info: 'session_id' in paymentResult ? {
                    expire_time: paymentResult.expire_time,
                    qr_info: paymentResult.qr_info
                } : null
            },
            statusCode: 201
        };

        const totalTime = Date.now() - startTime;
        console.log(`[${new Date().toISOString()}] Complete create order process. Total time: ${totalTime}ms`);

        return response;
    } catch (error: any) {
        console.error(`Create order failed after ${Date.now() - startTime}ms:`, error);
        return {
            success: false,
            error: error.message || 'Order creation failed',
            statusCode: 500
        };
    }
};

const generateUniqueOrderReference = async (): Promise<string> => {
    let orderReference: string = generateOrderReference();
    let isUnique = false;
    
    while (!isUnique) {
        const existingOrder = await OrderRepository.findByOrderReference(orderReference);
        if (!existingOrder) {
            isUnique = true;
        } else {
            orderReference = generateOrderReference();
        }
    }
    return orderReference;
};

export const getOrder = async (orderId: string): Promise<ServiceResponse> => {
    try {
        const order = await OrderRepository.findOrderById(orderId);
        if (!order) {
            return {
                success: false,
                error: "Order not found",
                statusCode: 404
            };
        }
        return {
            success: true,
            data: order,
            statusCode: 200
        };
    } catch (error) {
        return {
            success: false,
            error: "Internal server error",
            statusCode: 500
        };
    }
};

export const getAllOrders = async (): Promise<ServiceResponse> => {
    try {
        const orders = await OrderRepository.getAllOrders();
        return {
            success: true,
            data: orders,
            statusCode: 200
        };
    } catch (error) {
        return {
            success: false,
            error: "Internal server error",
            statusCode: 500
        };
    }
}; 