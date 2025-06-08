import { IsString } from "class-validator";
export class UpdateAccountDto {
  username?: string;
  password?: string;
  roleId?: string;
}
export class LoginDto {
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
    roleId: string;
}