import { Body, BodyParam, Controller, Get, Post, Req, UseBefore } from "routing-controllers";
import { Service } from "typedi";
import { AccountService } from "./account.service";
import { AccountDetailsDto, CreateAccountDto, LoginDto } from "../dtos/account.dto";
import { Auth } from "@/middlewares/auth.middleware";

@Service()
@Controller("/account")
export class AccountController{
    constructor(
        private accountService: AccountService
    ){}

    @Post()
    async createAccount(@Body() body: CreateAccountDto){
        return await this.accountService.createAccount(body);
    }

    @Post('/login')
    async login(@Body() body: LoginDto){
        return await this.accountService.login(body);
    }

    @Get('/details')
    @UseBefore(Auth)
    async viewAccountDetails(@Req() req: any){
        const user = req.user as AccountDetailsDto;
        return await this.accountService.viewAccountDetails(user.username);
    }
}