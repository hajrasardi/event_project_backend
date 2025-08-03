import { v2 as cloudinary, UploadApiResponse } from "cloudinary";
import * as streamifier from "streamifier"

cloudinary.config({
  api_key: "736136479999959",
  api_secret: "k-qSBDE1tVv1_jljStxbxvSM4Tk",
  cloud_name: "dab4oczcu",
});

export const cloudinaryUpload = (
  file: Express.Multer.File
): Promise<UploadApiResponse> => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      (err, result: UploadApiResponse) => {
        if (err) {
          reject(err);
        } else {
          resolve(result);
        }
      }
    );
    streamifier.createReadStream(file.buffer).pipe(uploadStream);
  });
};