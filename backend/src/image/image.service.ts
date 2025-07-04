import { EntityNotFoundException, NoFileUploadedException } from "@/exceptions/http-exceptions";
import { MinioClient } from "@/utils/minio/minio";
import { Service } from "typedi";
import { Image } from "./image.entity";
import { Product } from "@/product/product.entity";
import { In } from "typeorm";
import { Feedback } from "@/feedback/feedback.entity";
import { Account } from "@/auth/account/account.entity";

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

  async attachImagesToProduct(productId: string, imagesURL: string[]){
    const product = await Product.findOne({ where: { id: productId } });
    if (!product) throw new EntityNotFoundException("Product");
    const images = await Image.find({ where: { url: In(imagesURL) } });
    product.images = images;
    await product.save();
    return product;
  }

  async attachImagesToFeedback(feedbackId: string, imagesURL: string[]){
    const feedback = await Feedback.findOne({ where: { id: feedbackId } });
    if (!feedback) throw new EntityNotFoundException("Feedback");
    const images = await Image.find({ where: { url: In(imagesURL) } });
    feedback.images = images;
    await feedback.save();
    return feedback;
  }

  async attachImageToAccount(username: string, imageURL: string){
    const account = await Account.findOne({ where: { username } });
    if (!account) throw new EntityNotFoundException("Account");
    const image = await Image.findOne({ where: { url: imageURL } });
    if (!image) throw new EntityNotFoundException("Image");
    account.image = image;
    await account.save();
    return account;
  }
}
