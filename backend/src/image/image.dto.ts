import { IsArray, IsString } from "class-validator";

export class AttachImageDto {
    @IsString()
    query: string;

    @IsString()
    @IsArray()
    imagesURL: string[];
}