import { Router } from "express";
import {getTransactions,deposit, withdraw, transfer} from '../controllers/transactionController.js'
import { authenticateToken } from "../middleware/authMiddleware.js";

const router = Router()

router.get('/:accountNumber/transactions',authenticateToken,getTransactions)
router.post('/:accountNumber/transactions/deposit',authenticateToken,deposit)
router.post('/:accountNumber/transactions/withdraw',authenticateToken,withdraw)
router.post('/:accountNumber/transactions/transfer',authenticateToken,transfer)
export default router