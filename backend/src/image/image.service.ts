import { NoFileUploadedException } from "@/exceptions/http-exceptions";
import { Storage } from "@google-cloud/storage";
import * as path from "path";
import { Service } from "typedi";

const storage = new Storage({
  projectId: process.env.GOOGLE_CLOUD_PROJECT_ID,
  credentials: {
    client_email: process.env.GOOGLE_CLOUD_CLIENT_EMAIL,
    private_key: process.env.GOOGLE_CLOUD_PRIVATE_KEY?.replace(/\\n/g, "\n"),
  },
});
const bucketName = process.env.GOOGLE_CLOUD_BUCKET_NAME || "";

@Service()
export class ImageService {
    async uploadImage(file: Express.Multer.File): Promise<string> {
        if(!file) throw new NoFileUploadedException();
        const bucket = storage.bucket(bucketName);
        const blob = bucket.file(Date.now() + path.extname(file.originalname));
        const blobStream = blob.createWriteStream({ resumable: false, public: true });
      
        return new Promise((resolve, reject) => {
          blobStream.on("error", (err) => reject(err));
          blobStream.on("finish", () => {
            const publicUrl = `https://storage.googleapis.com/${bucketName}/${blob.name}`;
            resolve(publicUrl);
          });
          blobStream.end(file.buffer);
        });
    }
}

