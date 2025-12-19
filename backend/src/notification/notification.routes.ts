import { Router } from 'express';
import { subscribe, sendTest, getPublicKey } from './notification.controller';
// import { protect } from '../auth/auth.middleware'; // Uncomment when auth is ready for this route

const router = Router();

// Ideally protect these routes
router.get('/vapid-key', getPublicKey);
router.post('/subscribe', subscribe);
router.post('/send', sendTest); // Admin only in production

export default router;
