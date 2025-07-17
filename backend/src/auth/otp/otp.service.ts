import { Service } from "typedi";
import { Otp } from "./otp.entity";

@Service()
export class OtpService {
  async sendOtp(phone: string): Promise<Otp> {
    const otp = new Otp();
    otp.phone = phone;
    otp.code = Math.floor(Math.random() * 1000000)
      .toString()
      .padStart(6, "0");
    await otp.save();
    return otp;
  }

  async verifyOtp(phone: string, code: string): Promise<boolean> {
    const otp = await Otp.findOne({ where: { phone, code } });
    if (!otp) {
      return false;
    }
    const now = new Date();
    if (now.getTime() - otp.createdAt.getTime() > 3 * 60 * 1000) {
      return false;
    }
    otp.verified = true;
    await otp.save();
    return true;
  }

  async getActiveOtp(): Promise<Otp[]> {
    const otp =  await Otp.find({ where: { verified: false } });
    const now = new Date();
    const expired = otp.filter(otp => now.getTime() - otp.createdAt.getTime() > 3 * 60 * 1000);
    await Otp.remove(expired);
    return otp.filter(otp => now.getTime() - otp.createdAt.getTime() <= 3 * 60 * 1000);
  }
}
