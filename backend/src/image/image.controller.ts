import {
  Post,
  UploadedFile,
  BadRequestError,
  Controller,
  Body,
} from "routing-controllers";
import { Service } from "typedi";
import { ImageService } from "./image.service";

@Service()
@Controller("/image")
export class ImageController {
  constructor(private readonly imageService: ImageService) {}
  
  @Post("/upload")
  async upload(@UploadedFile("file") file: Express.Multer.File) {
    const newImage = await this.imageService.uploadImage(file);
    return newImage;
  }

  @Post("/attach-to-product")
  async attachToProduct(@Body() body: { productSlug: string, imagesURL: string[] }) {
    const product = await this.imageService.attachImagesToProduct(body.productSlug, body.imagesURL);
    return "Success";
  }

  @Post("/attach-to-feedback")
  async attachToFeedback(@Body() body: { feedbackId: string, imagesURL: string[] }) {
    const feedback = await this.imageService.attachImagesToFeedback(body.feedbackId, body.imagesURL);
    return "Success";
  }

  @Post("/attach-to-account")
  async attachToAccount(@Body() body: { username: string, imageURL: string }) {
    const account = await this.imageService.attachImageToAccount(body.username, body.imageURL);
    return "Success";
  }
}
