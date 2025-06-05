import { Body, BodyParam, Controller, Get, Post, Req, UseBefore } from "routing-controllers";
import { Service } from "typedi";
import { AccountService } from "./account.service";
import { AccountDetailsDto, CreateAccountDto, CredentialsDto } from "../dtos/account.dto";
import { TwilioService } from "@/utils/twilio/twilio";

@Service()
@Controller("/account")
export class AccountController{
    constructor(
        private readonly accountService: AccountService,
        private readonly twilioService: TwilioService
    ){}

    @Post()
    async createAccount(@Body() body: CreateAccountDto){
        return await this.accountService.createAccount(body);
    }

    @Post('/login')
    async login(@Body() body: CredentialsDto){
        return await this.accountService.login(body);
    }

    @Get('/details')
    // @UseBefore(Auth)
    async viewAccountDetails(@Req() req: any){
        const user = req.user as AccountDetailsDto;
        return await this.accountService.findAccountByUsername(user.username);
    }

    @Post('/change-password')
    // @UseBefore(Auth)
    async changePassword(@Req() req: any, @BodyParam('oldPassword') oldPassword: string){
        
    }

    @Post('/send-otp')
    async sendOtp(@BodyParam('username') username: string){
        return await this.twilioService.sendOtp(username);
    }

    @Post('/verify-otp')
    async verifyOtp(@BodyParam('username') username: string, @BodyParam('otp') otp: string){
        return this.twilioService.verifyOtp(username, otp);
    }
}