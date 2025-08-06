import { Router } from "express";
import TransactionController from "../controllers/transaction.controller";
import { verifyToken } from "../middleware/verifyToken";

const router = Router();
const transactionController = new TransactionController();

// Create transaction
router.post("/", verifyToken, (req, res, next) =>
  transactionController.createTransaction(req, res, next)
);

// Get all user transactions
router.get("/", verifyToken, (req, res, next) =>
  transactionController.getUserTransactions(req, res, next)
);

// Get transaction by ID
router.get("/:id", verifyToken, (req, res, next) =>
  transactionController.getTransactionById(req, res, next)
);

// Upload payment proof
router.patch("/:id/upload-proof", verifyToken, (req, res, next) =>
  transactionController.uploadPaymentProof(req, res, next)
);

// Cancel transaction
router.patch("/:id/cancel", verifyToken, (req, res, next) =>
  transactionController.cancelTransaction(req, res, next)
);

export default router;
