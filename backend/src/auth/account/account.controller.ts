import { Body, BodyParam, Controller, Delete, Get, Post, Req, UseBefore } from "routing-controllers";
import { Service } from "typedi";
import { AccountService } from "./account.service";
import { AccountDetailsDto, CreateAccountDto, CredentialsDto } from "../dtos/account.dto";
import { TwilioService } from "@/utils/twilio/twilio";
import { JwtService } from "../jwt/jwt.service";
import { Auth } from "@/middlewares/auth.middleware";

@Service()
@Controller("/account")
export class AccountController{
    constructor(
        private readonly accountService: AccountService,
        private readonly twilioService: TwilioService,
        private readonly jwtService: JwtService,
    ){}

    @Post("/register")
    async register(@Body() body: CreateAccountDto){
        const account = await this.accountService.createAccount(body);
        await this.twilioService.sendOtp(account.username);
        return "Check OTP message to complete registration"
    }

    @Post("/verify-register")
    async verifyRegister(@BodyParam("username") username: string, @BodyParam("otp") otp: string){
        const result = await this.twilioService.verifyOtp(username, otp);
        if(!result) return "OTP is wrong or is expired";
        const tokens = await this.accountService.finalizeCreateAccount(username);
        return tokens.accessToken;
    }

    @Delete("/registration-cancelled")
    async cancelRegistrations(){
        await this.accountService.removeNewAccounts();
    }

    @Post('/login')
    async login(@Body() body: CredentialsDto){
        return await this.accountService.login(body);
    }

    @Post('/logout')
    async logout(@BodyParam("username") username: string){
        return await this.accountService.logout(username);
    }

    @Get('/details')
    @UseBefore(Auth)
    async viewAccountDetails(@Req() req: any){
        const user = req.user as AccountDetailsDto;
        return await this.accountService.findAccountByUsername(user.username);
    }

    @Post('/change-password')
    // @UseBefore(Auth)
    async changePassword(@BodyParam('username') username: string,
    @BodyParam('oldPassword') oldPassword: string,
    @BodyParam('newPassword') newPassword: string){
        const account = await this.accountService.findAccountByUsername(username);
        const checkOldPassword = await this.accountService.checkOldPassword(account, oldPassword);
        if(!checkOldPassword) return false;
        return !!await this.accountService.changePassword(account, newPassword);
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