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
router.get('/', authenticateToken, handleGetOrders);
router.post('/', authenticateToken, handleCreateOrder);
router.post('/webhook', authenticateToken, handleWebhookCallback);

export default router; 