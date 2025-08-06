import { NextFunction, Request, Response } from "express";
import dotenv from "dotenv";
dotenv.config();
import cors from "cors";
import express, { Application } from "express";

import generateReferral from "./utils/generateReferral";
import AccountsRouter from "./routers/account.routers";
import AuthRouter from "./routers/auth.router";
import transactionRoute from "./routers/transaction.route";

import AppError from "./errors/AppError";

class App {
  public app: Application;
  private PORT: string = process.env.PORT || "8181";

  private accountRoute = new AccountsRouter();
  private authRouter = new AuthRouter();

  constructor() {
    this.app = express();
    this.configure();
    this.route();
    this.errorHandler();
  }

  private configure(): void {
    this.app.use(cors());
    this.app.use(express.json());
  }

  private route(): void {
    // Test route
    this.app.get("/", (req: Request, res: Response) => {
      const test = generateReferral();
      res.status(200).json({ success: true, referral: test });
    });

    // Main API routes
    this.app.use("/api/account", this.accountRoute.getRouter());
    this.app.use("/api/auth", this.authRouter.getRouter());
    this.app.use("/api/transactions", transactionRoute);
  }

  private errorHandler(): void {
    this.app.use(
      (error: unknown, req: Request, res: Response, next: NextFunction) => {
        if (error instanceof AppError) {
          return res.status(error.rc).json({
            success: error.success,
            message: error.message,
          });
        }
        return res.status(500).json({
          success: false,
          message: error instanceof Error ? error.message : "Unknown Error",
        });
      }
    );
  }

  public start(): void {
    this.app.listen(this.PORT, () => {
      console.log(`API RUNNING: http://localhost:${this.PORT}`);
    });
  }
}

export default App;
