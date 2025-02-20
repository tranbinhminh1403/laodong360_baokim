import { Router } from 'express';
import { handleCreateOrder } from '../controllers/OrderController';
import { handleWebhookCallback } from '../controllers/WebhookController';
import { testContactCenterLogin } from '../controllers/TestController';

const router = Router();

router.post('/send-order', handleCreateOrder);
router.post('/webhook', handleWebhookCallback);
router.get('/testlogin', testContactCenterLogin);

export default router; 