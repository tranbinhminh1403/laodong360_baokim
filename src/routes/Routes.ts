import { Router } from 'express';
import { handleCreateOrder } from '../controllers/OrderController';
import { handleWebhookCallback } from '../controllers/WebhookController';

const router = Router();

router.post('/send-order', handleCreateOrder);
router.post('/webhook', handleWebhookCallback);

export default router; 