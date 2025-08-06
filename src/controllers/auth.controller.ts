import { NextFunction, Request, Response } from "express";
import { prisma } from "../config/prisma";
import { hashPassword } from "../utils/hashPassword";
import generateReferral from "../utils/generateReferral";
import AppError from "../errors/AppError";
import { sign } from "jsonwebtoken";
import { resetPasswordMailTemplate } from "../templates/resetPassword.template";
import { transport } from "../config/nodemailers";
import { RoleName } from "../../prisma/generated/client";
import { compare } from "bcrypt";

class AuthController {
  // REGISTER
  public async register(req: Request, res: Response, next: NextFunction) {
    try {
      const dataUser = req.body;

      // 1. Create User
      const newUser = await prisma.user.create({
        data: {
          username: dataUser.username,
          name: dataUser.name,
          email: dataUser.email,
          phoneNumber: dataUser.phoneNumber,
          password: await hashPassword(dataUser.password),
          referralCode: generateReferral(),
        },
      });

      // 2. Assign Role USER
      const roleUser = await prisma.role.findUnique({
        where: { name: RoleName.USER },
      });

      if (!roleUser)
        throw new AppError("Role USER not found, please seed first", 500);

      // 3. Assign Role USER
      await prisma.userRole.create({
        data: {
          userId: newUser.id,
          roleId: roleUser.id, // ✅ pakai ID dari DB
          isActive: true,
        },
      });

      res.status(201).send({
        success: true,
        message: "Berhasil Daftar",
        data: { ...newUser, role: RoleName.USER },
      });
    } catch (error) {
      next(error);
    }
  }

  // LOGIN
  public async loginUser(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, password } = req.body;

      const user = await prisma.user.findUnique({
        where: { email },
        include: { roles: { include: { role: true } } },
      });

      if (!user) throw new AppError("Akun tidak ditemukan", 404);

      const comparePass = await compare(password, user.password);
      if (!comparePass)
        throw new AppError("Password atau Email tidak valid", 401);

      const token = sign(
        { id: user.id, isVerified: user.isVerified },
        process.env.TOKEN_KEY || "secret",
        { expiresIn: "1d" }
      );

      res.status(200).send({
        success: true,
        message: "Berhasil login",
        data: {
          id: user.id,
          username: user.username,
          email: user.email,
          roles: user.roles.map((r) => r.role.name),
          token,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  // KEEP LOGIN
  public async keepLogin(req: Request, res: Response, next: NextFunction) {
    try {
      const user = await prisma.user.findUnique({
        where: { id: parseInt(res.locals.decript.id) },
        include: { roles: { include: { role: true } } },
      });

      if (!user) throw new AppError("Akun tidak ditemukan", 404);

      const token = sign(
        { id: user.id, isVerified: user.isVerified },
        process.env.TOKEN_KEY || "secret"
      );

      res.status(200).send({
        username: user.username,
        email: user.email,
        isVerified: user.isVerified,
        roles: user.roles.map((r) => r.role.name),
        token,
      });
    } catch (error) {
      next(error);
    }
  }

  // VERIFY ACCOUNT
  public async verifyAccount(req: Request, res: Response, next: NextFunction) {
    try {
      await prisma.user.update({
        where: { id: parseInt(res.locals.decript.id) },
        data: { isVerified: true },
      });
      res.status(200).send({ success: true, message: "Verifikasi sukses" });
    } catch (error) {
      next(error);
    }
  }

  // FORGET PASSWORD
  public async forgetPassword(req: Request, res: Response, next: NextFunction) {
    try {
      const account = await prisma.user.findUnique({
        where: { email: req.body.email },
      });

      if (!account) throw new AppError("Akun tidak ditemukan", 401);

      const token = sign(
        { id: account.id, email: account.email },
        process.env.TOKEN_KEY || "secret",
        { expiresIn: "10m" }
      );

      await transport.sendMail({
        from: process.env.MAILSENDER,
        to: account.email,
        html: resetPasswordMailTemplate(
          account.username,
          `${process.env.FE_URL}/reset-password/${token}`
        ),
      });

      res.status(200).send({
        success: true,
        message: "Periksa email untuk pembaruan",
      });
    } catch (error) {
      next(error);
    }
  }

  // RESET PASSWORD
  public async resetPassword(req: Request, res: Response, next: NextFunction) {
    try {
      await prisma.user.update({
        where: { id: parseInt(res.locals.decript.id) },
        data: { password: await hashPassword(req.body.password) },
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
