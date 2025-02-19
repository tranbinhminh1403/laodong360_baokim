import { Request, Response } from 'express';
import { createOrder } from '../services/OrderService';

const orderConfig = {
  API_KEY: process.env.API_KEY!,
  SECRET_KEY: process.env.SECRET_KEY!,
  MERCHANT_ID: process.env.MERCHANT_ID!,
  URL_SUCCESS: process.env.PAYMENT_URL_SUCCESS!,
  URL_CANCEL: process.env.PAYMENT_URL_CANCEL!,
  URL_WEBHOOK: process.env.PAYMENT_URL_WEBHOOK!,
  URL_DETAIL: process.env.PAYMENT_URL_DETAIL!
};

export const handleCreateOrder = async (req: Request, res: Response) => {
  try {
    const result = await createOrder(req.body, orderConfig);
    res.status(result.success ? 200 : 500).json(result);
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
}; 