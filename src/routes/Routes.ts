import { Router } from 'express';
import { handleCreateOrder, handleGetOrders } from '../controllers/OrderController';
import { handleWebhookCallback } from '../controllers/WebhookController';
import { handleLogin, handleLogout } from '../controllers/AuthController';
import { authenticateToken } from '../middleware/authMiddleware';

const router = Router();

// Public routes
router.post('/auth/login', handleLogin);
router.post('/auth/logout', handleLogout);

// Protected routes
router.get('/', authenticateToken as any, handleGetOrders);
// router.post('/', authenticateToken, handleCreateOrder);
router.post('/webhook', handleWebhookCallback);

export default router; 