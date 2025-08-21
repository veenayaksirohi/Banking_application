import { Router } from "express";
import { createAccounts, getAccount, updateAccount, deleteAccount, closeAccount, getAccountBalance } from "../controllers/accountController.js";
import { authenticateToken } from "../middleware/authMiddleware.js";

const router = Router();

router.post('/', authenticateToken, createAccounts);
router.get('/:accountNumber', authenticateToken, getAccount);
router.patch('/:accountNumber', authenticateToken, updateAccount);
router.patch('/:accountNumber/close', authenticateToken, closeAccount);
router.delete('/:accountNumber', authenticateToken, deleteAccount);
router.get('/:accountNumber/balance', authenticateToken, getAccountBalance);

export default router;