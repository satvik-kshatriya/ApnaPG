import { Router } from 'express';
import { syncUser, getMe, updateMe } from '../controllers/userController.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';

const router = Router();

// Protected routes
router.use(authMiddleware);
router.post('/sync', syncUser);
router.get('/me', getMe);
router.patch('/me', updateMe);

export default router;
