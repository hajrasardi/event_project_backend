import { Router, Request, Response, NextFunction } from 'express';
import AuthController from '../controllers/auth.controller';
import { verifyToken } from '../middleware/verifyToken';


class AuthRouter {
    private route: Router;
    private authController: AuthController;


    constructor() {
        this.route = Router();
        this.authController = new AuthController();
        this.initializeRoutes();
    }

    private initializeRoutes(): void {
        
        this.route.post('/register', this.authController.register);
         console.log("run");

        this.route.post('/login', this.authController.loginUser);
       
        this.route.post('/lupa-password', this.authController.forgetPassword);

        this.route.use(verifyToken);

        this.route.get("/keep-login", this.authController.keepLogin);

        this.route.get("/verifiy", this.authController.verifyAccount);

        this.route.patch("/reset-password", this.authController.resetPassword);
            
    }

    public getRouter(): Router {
        return this.route;
    }
}

export default AuthRouter ;
