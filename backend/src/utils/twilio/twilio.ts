import { Service } from "typedi";
import { Twilio } from "twilio";
import { AccountService } from "@/auth/account/account.service";

const twilioClient = new Twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
const verifyServiceSid = process.env.TWILIO_VERIFY_SERVICE_SID || "";


@Service()
export class TwilioService {
  constructor(
    private readonly accountService: AccountService,
  ) {}

  async sendOtp(username: string): Promise<string> {
    const account = await this.accountService.findAccountByUsername(username);
    await twilioClient.verify.v2.services(verifyServiceSid).verifications.create({
      to: account.phone,
      channel: 'sms',
    });
    return "OTP sent";
  }

  async verifyOtp(username: string, otp: string): Promise<boolean> {
    const account = await this.accountService.findAccountByUsername(username);

    const result = await twilioClient.verify.v2.services(verifyServiceSid).verificationChecks.create({
      to: account.phone,
      code: otp,
    });

    return result.status === 'approved';
  }

  async sendOtpRegister(username: string, phone: string): Promise<String>{
    await twilioClient.verify.v2.services(verifyServiceSid).verifications.create({
      to: phone,
      channel: 'sms',
    });
    return "OTP sent";
  }

  async verifyOtpRegister(phone: string, otp: string): Promise<boolean>{
    const result = await twilioClient.verify.v2.services(verifyServiceSid).verificationChecks.create({
        to: phone,
        code: otp,
        });
    return result.status === 'approved';
  }
}
