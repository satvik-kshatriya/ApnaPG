import { Router } from 'express';
import { 
  createConnection, 
  listMyConnections, 
  updateConnectionStatus 
} from '../controllers/connectionController.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';

const router = Router();

router.use(authMiddleware);

router.post('/', createConnection);
router.get('/me', listMyConnections);
router.get('/owner', listMyConnections);
router.patch('/:id/status', updateConnectionStatus);

export default router;
