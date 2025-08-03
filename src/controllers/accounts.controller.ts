import { NextFunction, Request, Response } from "express";
import { prisma } from "../config/prisma";
import AppError from "../errors/AppError";
import { cloudinaryUpload } from "../config/cloudinary";
import generateReferral from "../utils/generateReferral";
import {UploadApiResponse} from "cloudinary"

class AccountsController {
    public async getDataUser(req: Request, res: Response) {
        try {
           const userId =  res.locals.decript.id
         const user =  await prisma.accounts.findUnique({
            where:{id: userId}
            
           })
           if(!user){
            throw new AppError("Id tidak valid", 404);
           }
           res.status(200).send({result:{
            success:true,
            message:"Id valid",
            data: user
           }
           })
        } catch (error) {
            console.log(error);
            res.status(500).send(error);
        }
    }
    public async update(req: Request, res: Response) {
        try {
            const userId = res.locals.decript.id
            const {name, phone_number}=req.body
            let img: UploadApiResponse | undefined
            
            const user = await prisma.accounts.update({
                where: {id: userId},data: {name, phone_number}
            });
            if (req.file) {
                img = await cloudinaryUpload(req.file);
                if (!img) {
                    throw new AppError("Gagal mengunggah gambar", 500);
                }
                await prisma.accounts.update({
                    where: {id: userId},
                    data: {img: img.secure_url}
                });
            }
            res.status(200).send({
                success: true,
                message: "Berhasil Update",
                data: {
                    id: user.id,
                    name: user.name,
                    phone_number: user.phone_number,
                    img: user.img
                }
            });
        } catch (error) {
            console.log(error);
            res.status(500).send("Error");
        }
    }
    public async deleteAccount(req: Request, res: Response) {
        try {
            const userId = res.locals.decript.id;
            await prisma.accounts.delete({
                where: {
                    id: userId,
                },
            });
            res.status(200).send({
                success: true,
                message: "Akun berhasil dihapus",
            });
        } catch (error) {
            console.log(error);
            res.status(500).send(error);
        }
    }
    public async updateProfileImg(
        req: Request,
        res: Response,
        next: NextFunction
    ) {
        try {
            const userId = res.locals.decript.id;
            let img: UploadApiResponse | undefined;

            if (!req.file) {
                throw new AppError("Tidak ada file yang diunggah", 400);
            }

            img = await cloudinaryUpload(req.file);
            if (!img) {
                throw new AppError("Gagal mengunggah gambar", 500);
            }

            const updatedUser = await prisma.accounts.update({
                where: { id: userId },
                data: { img: img.secure_url },
            });

            res.status(200).send({
                success: true,
                message: "Berhasil memperbarui gambar profil",
                data: {
                    id: updatedUser.id,
                    name: updatedUser.name,
                    phone_number: updatedUser.phone_number,
                    img: updatedUser.img,
                },
            });
        } catch (error) {
            next(error);
        }
    }
}

export default AccountsController;