import { Router } from 'express';
import { sendOrder, handleWebhook } from '../controllers/OrderController';

const router = Router();

router.post('/send-order', sendOrder);
router.post('/webhook', handleWebhook);

export default router; 