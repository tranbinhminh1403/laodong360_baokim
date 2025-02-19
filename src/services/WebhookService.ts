import { WebhookPayload } from '../types/Types';
import * as OrderRepository from '../repositories/OrderRepository';
import { verifyWebhook } from '../utils/webhookVerify';
import { sendPaymentSuccessEmail, sendPaymentSuccessEmailToAccountant, sendPaymentSuccessEmailToAdmin } from './EmailService';

export const handleWebhook = async (
  webhookData: string,
  secretKey: string
): Promise<{
  err_code: string;
  message: string;
}> => {
  try {
    const isValid = verifyWebhook(secretKey, webhookData);
    if (!isValid) {
      return {
        err_code: "1",
        message: "Invalid signature"
      };
    }

    const parsedData: WebhookPayload = typeof webhookData === 'string' 
      ? JSON.parse(webhookData) 
      : webhookData;

    const success = await processWebhook(parsedData);
    
    return {
      err_code: success ? "0" : "1",
      message: success ? "some message" : "Payment processing failed"
    };

  } catch (error: any) {
    return {
      err_code: "1",
      message: error.message.substring(0, 255)
    };
  }
};

const processWebhook = async (payload: WebhookPayload): Promise<boolean> => {
  const { order, txn } = payload;

  if (order.stat !== 'c' || txn.stat !== 1) {
    return false;
  }

  const existingOrder = await OrderRepository.getOrderByMrcOrderId(order.mrc_order_id);
  if (!existingOrder) {
    return false;
  }

  const orderWithTotalAmount = {
    ...existingOrder,
    price: txn.total_amount 
  };

  await Promise.all([
    OrderRepository.updateOrderStatus(existingOrder.id, 'Completed'),
    sendPaymentSuccessEmail(orderWithTotalAmount),
    sendPaymentSuccessEmailToAdmin(existingOrder),
    sendPaymentSuccessEmailToAccountant(existingOrder)
  ]);

  return true;
}; 