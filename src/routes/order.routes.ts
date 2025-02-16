import { Router } from 'express';
import { sendOrder, handleWebhook, testWebhook } from '../controllers/OrderController';

const router = Router();

router.post('/send-order', sendOrder);
router.post('/webhook', handleWebhook);
router.post('/webhook/test', testWebhook);

export default router; 