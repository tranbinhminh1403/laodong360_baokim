import { Router } from 'express';
import { sendOrder } from '../controllers/OrderController';

const router = Router();

router.post('/send-order', sendOrder);

export default router; 