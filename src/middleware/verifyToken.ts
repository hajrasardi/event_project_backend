import { Request, Response, NextFunction } from "express";
import { verify } from "jsonwebtoken";

export const verifyToken = (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const token = req.headers.authorization?.split(" ")[1];
        if (!token) {
            throw {success:false, message: "Token tidak ditemukan"};
        }
        const checkToken = verify(token, process.env.TOKEN_KEY || "secret");

        res.locals.decript= checkToken;
        next();
    } catch (error) {
        next(error);
    }
};