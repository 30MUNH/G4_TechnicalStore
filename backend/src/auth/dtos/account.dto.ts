import { IsObject, IsString } from "class-validator";
import { Role } from "../role/role.entity";

export class CredentialsDto {
    @IsString()
    username: string;

    @IsString()
    password: string;
}

export class CreateAccountDto {
    @IsString()
    username: string;

    @IsString()
    password: string;

    @IsString()
    phone: string;

    @IsString()
    roleSlug: string;
}

export class AccountDetailsDto {
    @IsString()
    username: string;

    @IsString()
    phone: string;

    @IsObject()
    role: Role;
}