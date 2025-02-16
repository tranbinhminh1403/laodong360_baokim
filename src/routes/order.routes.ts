import { Router } from 'express';
import { sendOrder, handleWebhook, testVerifyWebhook } from '../controllers/OrderController';

const router = Router();

router.post('/send-order', sendOrder);
router.post('/webhook', handleWebhook);
router.post('/test-verify', testVerifyWebhook);

export default router; 