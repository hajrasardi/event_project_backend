import { NextFunction, Request, Response } from "express";
import { prisma } from "../config/prisma";
import { hash } from "crypto";
import { hashPassword } from "../utils/hashPassword";
import generateReferral from "../utils/generateReferral";
import AppError from "../errors/AppError";
import { sign } from "jsonwebtoken";
import { resetPasswordMailTemplate } from "../templates/resetPassword.template";
import { transport } from "../config/nodemailers";
import { Role } from "../../prisma/generated/client";
import { compare } from "bcrypt";

class AuthController {
  public async register(req: Request, res: Response, next: NextFunction) {
    try {
      const dataUser = req.body;
      const userBaru = await prisma.accounts.create({
        data: {
          role: Role.USER,
          ...dataUser,
          password: await hashPassword(req.body.password),
          referral: generateReferral(),
        },
      });
      console.log(userBaru);
      if (!userBaru) {
        throw new AppError("Gagal Daftar", 500);
      }
      res.status(201).send({
        result: {
          success: true,
          message: "Berhasil Daftar",
          data: userBaru,
        },
      });
    } catch (error) {
      next(error);
    }
  }
  public async loginUser(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, password } = req.body;
      console.log(email);
      console.log(req.body);
      const data = await prisma.accounts.findUnique({
        where: {
          email,
        },
      });

      if (!data) {
        throw new AppError("Akun tidak ditemukan", 404);
      }
      const comparePass = compare(data.password, password);
      if (!comparePass) {
        throw new AppError("Password atau Email tidak valid", 401);
      }
      res.status(201).send({
        result: {
          success: true,
          message: "Berhasil login",
          data: data,
        },
      });
    } catch (error) {
      next(error);
    }
  }
  public async keepLogin(req: Request, res: Response, next: NextFunction) {
    try {
      const account = await prisma.accounts.findUnique({
        where: {
          id: parseInt(res.locals.decript.id),
        },
        omit: {
          password: true,
        },
      });
      if (!account) {
        throw new AppError("Akun tidak ditemukan", 404);
      }
      const token = sign(
        {
          id: account?.id,
          isVerified: account?.isVerified,
          role: account?.role,
        },
        process.env.TOKEN_KEY || "secret"
      );
      res.status(200).send({
        username: account.username,
        email: account.email,
        isVerified: account.isVerified,
        role: account.role,
        token,
      });
    } catch (error) {
      next(error);
    }
  }
  public async verifyAccount(req: Request, res: Response, next: NextFunction) {
    try {
      const account = await prisma.accounts.update({
        where: {
          id: parseInt(res.locals.decript.id),
        },
        data: { isVerified: true },
      });
      res.status(200).send({
        success: true,
        message: "Verifikasi sukses",
      });
    } catch (error) {
      next(error);
    }
  }
  public async forgetPassword(req: Request, res: Response, next: NextFunction) {
    try {
      const account = await prisma.accounts.findUnique({
        where: {
          email: req.body.email,
        },
      });
      if (!account) {
        throw new AppError("Akun tidak ditemukan", 401);
      }
      const token = sign(
        {
          id: account.id,
          email: account.email,
          role: account.role,
        },
        process.env.TOKEN_KEY || "secret",
        { expiresIn: "10m" }
      );
      await transport.sendMail({
        sender: process.env.MAILSENDER,
        to: account.email,
        html: resetPasswordMailTemplate(
          account.username,
          `${process.env.FE_URL}/reset-password/${token}`
        ),
      });
      res.status(200).send({
        success: true,
        message: "periksa email untuk pembaruan",
      });
    } catch (error) {
      next(error);
    }
  }
  public async resetPassword(req: Request, res: Response, next: NextFunction) {
    try {
      await prisma.accounts.update({
        where: {
          id: parseInt(res.locals.decript.id),
        },
        data: {
          password: await hashPassword(req.body.password),
        },
      });
      res.status(200).send({
        success: true,
        message: "Reset password sukses",
      });
    } catch (error) {
      next(error);
    }
  }
}

export default AuthController;
