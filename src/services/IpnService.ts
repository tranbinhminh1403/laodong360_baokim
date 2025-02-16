import { IpnRequest } from '../types/IpnRequest';
import { AppDataSource } from '../config/data-source';
import { Orders } from '../entities/Orders';
import { ServiceResponse } from '../types/ServiceResponse';
import { sendPaymentSuccessEmail, sendNewOrderNotification } from './EmailService';
import { verifyResponseMAC } from '../utils/VerifyMAC';
import { findOrderWithMinimalFields } from '../repositories/OrderRepository';
import * as OrderRepository from '../repositories/OrderRepository';

if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD || !process.env.ADMIN_EMAIL || !process.env.SUPPORT_EMAIL) {
    throw new Error('Missing required email environment variables');
}

export const processIpnCallback = async (ipnData: IpnRequest): Promise<ServiceResponse> => {
    const startTime = Date.now();
    
    try {
        // Verify MAC song song với query database
        const [isValidMAC, order] = await Promise.all([
            verifyResponseMAC(ipnData, process.env.PAYMENT_SECRET_KEY || ''),
            AppDataSource
                .getRepository(Orders)
                .createQueryBuilder('order')
                .where('order.orderReference = :orderReference', { 
                    orderReference: ipnData.pg_order_reference 
                })
                .getOne() // Lấy full thông tin order để gửi mail
        ]);

        if (!isValidMAC) {
            console.error(`[${Date.now() - startTime}ms] Invalid MAC in IPN request`);
            return {
                success: false,
                error: 'Invalid IPN request MAC',
                statusCode: 400
            };
        }

        if (!order) {
            console.error(`[${Date.now() - startTime}ms] Order not found`);
            return {
                success: false,
                error: 'Order not found',
                statusCode: 404
            };
        }

        if (ipnData.error_code === '00') {
            // Xử lý bất đồng bộ cho update DB và gửi email
            Promise.all([
                OrderRepository.updateOrderStatus(order.id, 'Success'),
                sendPaymentSuccessEmail(order),
                sendPaymentSuccessEmail({
                    ...order,
                    email: process.env.ADMIN_EMAIL || 'laodong360@interits.com'
                })
            ]).catch(error => {
                console.error('Background operations failed:', error);
                console.error('Order data:', order); // Log để debug
            });

            console.log(`[${Date.now() - startTime}ms] IPN process completed successfully`);
            return {
                success: true,
                data: {
                    message: 'Order status updated successfully',
                    orderReference: ipnData.pg_order_reference
                },
                statusCode: 200
            };
        }

        return {
            success: false,
            error: 'Payment failed',
            statusCode: 400
        };
    } catch (error: any) {
        console.error(`[${Date.now() - startTime}ms] IPN process failed:`, error);
        return {
            success: false,
            error: error.message || 'Internal server error',
            statusCode: 500
        };
    }
};