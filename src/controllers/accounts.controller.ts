import { NextFunction, Request, Response } from "express";
import { prisma } from "../config/prisma";
import AppError from "../errors/AppError";
import { cloudinaryUpload } from "../config/cloudinary";
import { UploadApiResponse } from "cloudinary";

class AccountsController {
  // 1️⃣ GET USER BY TOKEN
  public async getDataUser(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = parseInt(res.locals.decript.id);

      const user = await prisma.user.findUnique({
        where: { id: userId },
      });

      if (!user) throw new AppError("Id tidak valid", 404);

      res.status(200).send({
        success: true,
        message: "Id valid",
        data: user,
      });
    } catch (error) {
      next(error);
    }
  }

  // 2️⃣ UPDATE USER DATA + OPTIONAL PROFILE IMAGE
  public async update(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = parseInt(res.locals.decript.id);
      const { name, phoneNumber } = req.body;
      let uploadedImg: UploadApiResponse | undefined;

      // Jika ada file gambar, upload dulu ke Cloudinary
      if (req.file) {
        uploadedImg = await cloudinaryUpload(req.file);
        if (!uploadedImg) throw new AppError("Gagal mengunggah gambar", 500);
      }

      // Update data user di DB (sekali query)
      const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: {
          name,
          phoneNumber,
          ...(uploadedImg && { profileImage: uploadedImg.secure_url }),
        },
      });

      res.status(200).send({
        success: true,
        message: "Berhasil Update",
        data: {
          id: updatedUser.id,
          name: updatedUser.name,
          phoneNumber: updatedUser.phoneNumber,
          img: updatedUser.profileImage,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  // 3️⃣ DELETE ACCOUNT
  public async deleteAccount(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = parseInt(res.locals.decript.id);

      const deletedUser = await prisma.user.delete({
        where: { id: userId },
      });

      if (!deletedUser) throw new AppError("Akun tidak ditemukan", 404);

      res.status(200).send({
        success: true,
        message: "Akun berhasil dihapus",
      });
    } catch (error) {
      next(error);
    }
  }

  // 4️⃣ UPDATE ONLY PROFILE IMAGE
  public async updateProfileImg(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const userId = parseInt(res.locals.decript.id);

      if (!req.file) throw new AppError("Tidak ada file yang diunggah", 400);

      const uploadedImg = await cloudinaryUpload(req.file);
      if (!uploadedImg) throw new AppError("Gagal mengunggah gambar", 500);

      const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: { profileImage: uploadedImg.secure_url },
      });

      res.status(200).send({
        success: true,
        message: "Berhasil memperbarui gambar profil",
        data: {
          id: updatedUser.id,
          name: updatedUser.name,
          phoneNumber: updatedUser.phoneNumber,
          img: updatedUser.profileImage,
        },
      });
    } catch (error) {
      next(error);
    }
  }
}

export default AccountsController;
