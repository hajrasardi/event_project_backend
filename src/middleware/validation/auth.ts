import { Request, Response, NextFunction } from "express";
import {body, validationResult} from "express-validator";

const validationHandler = (req: Request, res: Response, next:NextFunction) => {
    try {
        const errorValidation = validationResult(req);
        if (!errorValidation.isEmpty()) {
            throw errorValidation.array();
        } else {
            next ();
        }
    } catch (error) {
        next(error)
    }
};

export const regisValidation = [
    body("username").notEmpty().withMessage("Username dibutuhkan"),
    body("email").notEmpty().isEmail().withMessage("Email dibutuhkan"),
    body("password").notEmpty().isStrongPassword({
        minLength:8,
        minLowercase:1,
        minUppercase:1,
        minNumbers:1,
        minSymbols:1, 
    }),
    validationHandler,
];