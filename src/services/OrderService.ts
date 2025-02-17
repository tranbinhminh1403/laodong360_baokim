import axios from 'axios';
import { IOrderRequest, IOrderResponse } from '../types/Types';
import { generateJWTToken } from '../utils/jwt';
import * as OrderRepository from '../repositories/OrderRepository';
import { sendNewOrderNotification } from './EmailService';

interface OrderConfig {
  API_KEY: string;
  SECRET_KEY: string;
  MERCHANT_ID: string;
  URL_SUCCESS: string;
  URL_CANCEL: string;
  URL_WEBHOOK: string;
}

export const createOrder = async (
  orderData: IOrderRequest, 
  config: OrderConfig
): Promise<IOrderResponse> => {
  try {
    const jwtToken = generateJWTToken(config.API_KEY, config.SECRET_KEY);
    const mrc_order_id = `ORDER_${Math.floor(Date.now() / 1000)}`;
    const API_URL = process.env.API_CREATE_ORDER_URL || '';

    const payload = {
      merchant_id: parseInt(config.MERCHANT_ID),
      mrc_order_id,
      total_amount: parseInt(orderData.price.toString()),
      description: `Thanh toán đơn hàng ${mrc_order_id}`,
      webhooks: config.URL_WEBHOOK,
      url_success: config.URL_SUCCESS,
      url_cancel: config.URL_CANCEL,
      lang: orderData.lang || 'vi'
    };

    const response = await axios.post(API_URL, payload, {
      headers: {
        'Content-Type': 'application/json',
        'jwt': `Bearer ${jwtToken}`
      }
    });

    // if (response.data.data.order_id) {
    //   await OrderRepository.createOrder({
    //     ...orderData,
    //     mrc_order_id,
    //     order_id: response.data.data.order_id,
    //     status: "Pending"
    //   });
    // }
    if (response.data.data.order_id) {
      const order = {
        ...orderData,
        mrc_order_id,
        order_id: response.data.data.order_id,
        status: "Pending"
      };
      
      await Promise.all([
        OrderRepository.createOrder(order),
        sendNewOrderNotification(order)
      ]);
    }

    return {
      success: true,
      data: {
        order_id: response.data.data.order_id,
        redirect_url: response.data.data.redirect_url,
        payment_url: response.data.data.payment_url,
      }
    };

  } catch (error: any) {
    return {
      success: false,
      error: error.message,
      error_response: error.response?.data
    };
  }
}; 