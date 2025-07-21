import { BodyParam, Controller, Get, Post } from "routing-controllers";
import { Service } from "typedi";
import { OtpService } from "./otp.service";

@Service()
@Controller("/otp")
export class OtpController {
    constructor(private readonly otpService: OtpService) {}

    @Get("/active")
    async getActiveOtp() {
        return await this.otpService.getActiveOtp();
    }

    @Post("/send")
    async sendOtp(@BodyParam("phone") phone: string) {
        return await this.otpService.sendOtp(phone);
    }

    @Post("/verify")
    async verifyOtp(@BodyParam("phone") phone: string, @BodyParam("otp") otp: string) {
        return await this.otpService.verifyOtp(phone, otp);
    }
}