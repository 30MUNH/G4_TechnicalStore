import {
  Post,
  UploadedFile,
  BadRequestError,
  Controller,
} from "routing-controllers";
import { Service } from "typedi";
import { ImageService } from "./image.service";

@Service()
@Controller("/image")
export class ImageController {
  constructor(private readonly imageService: ImageService) {}
  
  @Post("/upload")
  async upload(@UploadedFile("file") file: Express.Multer.File) {
    const url = await this.imageService.uploadImage(file);
    return { url };
  }
}
