import { Router } from 'express';
import { downloadLease } from '../controllers/documentController.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';

const router = Router();

// Gated routes
router.use(authMiddleware);

router.get('/lease/:connection_id', downloadLease);

export default router;
