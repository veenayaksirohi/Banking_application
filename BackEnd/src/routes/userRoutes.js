import { Router } from 'express';
import { getUser,updateUser,deleteUser,listUserAccounts } from '../controllers/userController.js';
import { authenticateToken } from '../middleware/authMiddleware.js';

const router = Router();

// Apply middleware directly to the route where userId is available
router.get('/:userId', authenticateToken, getUser);
router.put('/:userId', authenticateToken, updateUser);
router.delete('/:userId', authenticateToken, deleteUser);
router.get('/:userId/accounts', authenticateToken, listUserAccounts);
export default router;
