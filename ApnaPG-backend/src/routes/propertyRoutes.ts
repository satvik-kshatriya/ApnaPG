import { Router } from 'express';
import { 
  createProperty, 
  listProperties, 
  getProperty, 
  updateProperty, 
  deleteProperty,
  listOwnerProperties
} from '../controllers/propertyController.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';
import { requireRole } from '../middlewares/requireRole.js';

const router = Router();

// Public routes
router.get('/', listProperties);
router.get('/owner', authMiddleware, requireRole(['owner', 'admin']), listOwnerProperties);
router.get('/:id', getProperty);

// Protected routes (Owner/Admin)
router.post('/', authMiddleware, requireRole(['owner', 'admin']), createProperty);
router.put('/:id', authMiddleware, requireRole(['owner', 'admin']), updateProperty);
router.delete('/:id', authMiddleware, requireRole(['owner', 'admin']), deleteProperty);

export default router;
