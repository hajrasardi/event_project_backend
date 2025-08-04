import { NextFunction, Request, Response } from "express";
import dotenv from "dotenv";
dotenv.config();
import cors from "cors";
import express, { Application } from "express";
import generateReferral from "./utils/generateReferral";
import AccountsRouter from "./routers/account.routers";
import AppError from "./errors/AppError";
import AuthController from "./controllers/auth.controller";
import AuthRouter from "./routers/auth.router";

class App {
  public app: Application;

  private PORT: string = process.env.PORT || "8181";
  private accountRoute = new AccountsRouter();
  private authRouter = new AuthRouter();
  // private authRoute

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
    this.app.get("/", (req: Request, res: Response) => {
      const test = generateReferral();

      console.log(test);

      res.status(200).send(test);
    });
    this.app.use("/account", this.accountRoute.getRouter());
    console.log("run");

    this.app.use("/auth", this.authRouter.getRouter());
    console.log("run");
  }
  private errorHandler = (): void => {
    this.app.use(
      (error: unknown, req: Request, res: Response, next: NextFunction) => {
        if (error instanceof AppError) {
          return res
            .status(error.rc)
            .send({
              result: { success: error.success, message: error.message },
            });
        }
        return res
          .status(500)
          .send(error instanceof Error ? error : "Error Tidak Diketahui");
      }
    );
  };
  public start(): void {
    this.app.listen(this.PORT, () => {
      console.log(`API RUNNING: http://localhost:${this.PORT}`);
    });
  }
}

export default App;
