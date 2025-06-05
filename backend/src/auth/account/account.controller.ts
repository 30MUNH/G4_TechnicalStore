import { Body, BodyParam, Controller, Delete, Get, Post, Req, UseBefore } from "routing-controllers";
import { Service } from "typedi";
import { AccountService } from "./account.service";
import { AccountDetailsDto, CreateAccountDto, CredentialsDto } from "../dtos/account.dto";
import { TwilioService } from "@/utils/twilio/twilio";
import { Auth } from "@/middlewares/auth.middleware";

@Service()
@Controller("/account")
export class AccountController{
    constructor(
        private readonly accountService: AccountService,
        private readonly twilioService: TwilioService,
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
        const account = await this.accountService.login(body);
        await this.twilioService.sendOtp(account.username);
        return "Check OTP message to complete login";
    }

    @Post('/verify-login')
    async verifyLogin(@BodyParam("username") username: string, @BodyParam("otp") otp: string){
        const result = await this.twilioService.verifyOtp(username, otp);
        if(!result) return "OTP is wrong or is expired";
        const token = await this.accountService.finalizeLogin(username);
        return token;
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
    @UseBefore(Auth)
    async preChangePassword(@Req() req: any,
    @BodyParam('oldPassword') oldPassword: string,
    @BodyParam('newPassword') newPassword: string){
        const user = req.user as AccountDetailsDto
        const account = await this.accountService.findAccountByUsername(user.username);
        const checkOldPassword = await this.accountService.checkOldPassword(account, oldPassword);
        if(!checkOldPassword) return "Wrong old password";
        await this.twilioService.sendOtp(account.username);
        return "Check OTP message to complete login";
    }

    @Post('/verify-change-password')
    async verifyChangePassword(@BodyParam("username") username: string, 
    @BodyParam("otp") otp: string, 
    @BodyParam('newPassword') newPassword: string){
        const result = await this.twilioService.verifyOtp(username, otp);
        if(!result) return "OTP is wrong or is expired";
        const account = await this.accountService.findAccountByUsername(username);
        const token = await this.accountService.changePassword(account, newPassword);
        return token;
    }

    @Post('/forgot-password')
    async forgotPassword(@BodyParam("username") username: string){
        const account = await this.accountService.findAccountByUsername(username);
        if(!account) return "This user does not exist";
        await this.twilioService.sendOtp(account.username);
        return "Check OTP message to reset password";
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