import { Router } from "express";
import AccountsController from "../controllers/accounts.controller";
import AuthController from "../controllers/auth.controller";

class AccountsRouter{
    private route: Router;
    private accountsController: AccountsController;
    private authController: AuthController;
    constructor(){
        this.route=Router();
        this.accountsController=new AccountsController;
        this.authController=new AuthController;
        this.initializeRoutes();
    }
    private initializeRoutes():void {
        this.route.get("/get",this.accountsController.getDataUser);
        this.route.post("/register", this.authController.register);
        this.route.put("/update", this.accountsController.update);
        this.route.delete("/delete", this.accountsController.deleteAccount);
       
       
    }
    public getRouter(): Router{
        return this.route;
    }
}

export default AccountsRouter;