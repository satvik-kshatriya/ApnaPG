import { Router } from 'express';
import { createReview, getUserReviews } from '../controllers/reviewController.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';

const router = Router();

// Public Get
router.get('/user/:id', getUserReviews);

// Protected Post
router.post('/', authMiddleware, createReview);

export default router;
