import { Request, Response, NextFunction } from "express";
import { prisma } from "../config/prisma";
import AppError from "../errors/AppError";
import { TransactionStatus } from "../../prisma/generated/client";

class TransactionController {
  // 1. Create Transaction
  public async createTransaction(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const { screeningId, ticketTypeId, quantity } = req.body;
      const userId = res.locals.decript.id;

      // 1. Check screening
      const screening = await prisma.screening.findUnique({
        where: { id: screeningId },
      });
      if (!screening) throw new AppError("Screening not found", 404);

      // 2. Check available seats
      if (screening.availableSeats < quantity) {
        throw new AppError("Not enough available seats", 400);
      }

      // 3. Deduct available seats
      await prisma.screening.update({
        where: { id: screeningId },
        data: { availableSeats: { decrement: quantity } },
      });

      // 4. Get ticket type price
      const ticketType = await prisma.ticketType.findUnique({
        where: { id: ticketTypeId },
      });
      if (!ticketType) throw new AppError("Ticket type not found", 404);

      const totalPrice = ticketType.price * quantity;

      // 5. Create transaction
      const transaction = await prisma.transaction.create({
        data: {
          customerId: userId,
          screeningId,
          status: TransactionStatus.WAITING_PAYMENT,
          transactionCode: `TRX-${Date.now()}`,
          totalPrice,
          expiredAt: new Date(Date.now() + 2 * 60 * 60 * 1000), // 2 hours
          orderItems: {
            create: {
              ticketTypeId,
              quantity,
              subTotal: totalPrice,
            },
          },
        },
        include: { orderItems: true },
      });

      res.status(201).send({
        success: true,
        message:
          "Transaction created. Please upload payment proof within 2 hours.",
        data: transaction,
      });
    } catch (error) {
      next(error);
    }
  }

  // 2. Upload Payment Proof
  public async uploadPaymentProof(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const { id } = req.params;
      const { paymentProof } = req.body; // base64 or URL

      const transaction = await prisma.transaction.update({
        where: { id: parseInt(id) },
        data: { paymentProof, status: TransactionStatus.WAITING_CONFIRMATION },
      });

      res.status(200).send({
        success: true,
        message: "Payment proof uploaded",
        data: transaction,
      });
    } catch (error) {
      next(error);
    }
  }

  // 3. Cancel Transaction (restore seats)
  public async cancelTransaction(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const { id } = req.params;
      const userId = res.locals.decript.id;

      const transaction = await prisma.transaction.findUnique({
        where: { id: parseInt(id) },
        include: { orderItems: true },
      });

      if (!transaction || transaction.customerId !== userId) {
        throw new AppError("Transaction not found or unauthorized", 404);
      }

      // Restore seats
      const totalSeats = transaction.orderItems.reduce(
        (sum, item) => sum + item.quantity,
        0
      );
      await prisma.screening.update({
        where: { id: transaction.screeningId },
        data: { availableSeats: { increment: totalSeats } },
      });

      // Update status
      await prisma.transaction.update({
        where: { id: transaction.id },
        data: { status: TransactionStatus.CANCELED },
      });

      res.status(200).send({
        success: true,
        message: "Transaction canceled and seats restored",
      });
    } catch (error) {
      next(error);
    }
  }

  // 4. Get all user transactions
  public async getUserTransactions(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const userId = res.locals.decript.id;

      const transactions = await prisma.transaction.findMany({
        where: { customerId: userId },
        include: {
          screening: { include: { movie: true, cinema: true } },
          orderItems: { include: { ticketType: true } },
        },
        orderBy: { createdAt: "desc" },
      });

      res.status(200).send({ success: true, data: transactions });
    } catch (error) {
      next(error);
    }
  }

  // 5. Get transaction by ID
  public async getTransactionById(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const { id } = req.params;
      const transaction = await prisma.transaction.findUnique({
        where: { id: parseInt(id) },
        include: {
          screening: { include: { movie: true, cinema: true } },
          orderItems: { include: { ticketType: true } },
        },
      });

      if (!transaction) throw new AppError("Transaction not found", 404);

      res.status(200).send({ success: true, data: transaction });
    } catch (error) {
      next(error);
    }
  }
}

export default TransactionController;
