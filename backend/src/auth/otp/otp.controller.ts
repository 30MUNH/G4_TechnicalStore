import { Controller, Get } from "routing-controllers";
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
}