import { NoFileUploadedException } from "@/exceptions/http-exceptions";
import { HttpMessages } from "@/exceptions/http-messages.constant";
import { MinioClient } from "@/utils/minio/minio";
import { Service } from "typedi";
import { Image } from "./image.entity";

@Service()
export class ImageService {

  async uploadImage(file: Express.Multer.File) {
    if (!file) throw new NoFileUploadedException;
      console.log('uploading');
      const uploadedFile = await MinioClient.getInstance().upload(file);
      const newImage = new Image();
      newImage.originalName = file.originalname;
      newImage.name = uploadedFile ? uploadedFile.fileName : '';
      newImage.url = uploadedFile ? uploadedFile.url : '';
      await newImage.save();
      return newImage;
  }
}
