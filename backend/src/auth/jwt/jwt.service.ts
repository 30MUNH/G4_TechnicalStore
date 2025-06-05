import { Service } from "typedi";
import { AccountDetailsDto } from "../dtos/account.dto";
import jwt, { JwtPayload } from "jsonwebtoken";
import { RefreshToken } from "./refreshToken.entity";
import { Account } from "../account/account.entity";
import { AccountNotFoundException } from "@/exceptions/http-exceptions";

const JWT_SECRET = process.env.JWT_SECRET || "";
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET || "";

@Service()
export class JwtService {

  private accountToPayload(account: Account): AccountDetailsDto{
    return {
      username: account.username,
      phone: account.phone,
      role: account.role
    };
  }

  generateAccessToken(account: Account): string {
    const payload = this.accountToPayload(account);
    return jwt.sign(payload, JWT_SECRET, { expiresIn: "1d" });
  }

  async generateRefreshToken(account: Account): Promise<string> {
    const payload = this.accountToPayload(account);
    const token = jwt.sign(payload, REFRESH_TOKEN_SECRET, { expiresIn: "7d" });
    const oldRefreshToken = await RefreshToken.find({
      where: {
        account,
      },
    });
    if (oldRefreshToken.length > 0) {
      await Promise.all(oldRefreshToken.map((t) => t.softRemove()));
    }
    const refreshToken = new RefreshToken();
    refreshToken.token = token;
    refreshToken.account = account;
    refreshToken.expiredAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    await refreshToken.save();
    return token;
  }

  async verifyRefreshToken(token: string): Promise<RefreshToken | null> {
    try {
      const decoded = jwt.verify(token, REFRESH_TOKEN_SECRET) as {
        username: string;
      };
      const account = await Account.findOne({
        where: {
          username: decoded.username
        }
      });
      if(!account) throw new AccountNotFoundException;
      const refreshToken = await RefreshToken.findOne({
        where: {
          token,
          account,
        },
      });
      if (!refreshToken) return null;
      if (refreshToken.expiredAt < new Date()) {
        await refreshToken.softRemove();
        return null;
      }
      return refreshToken;
    } catch {
      return null;
    }
  }

  verifyAccessToken(token: string): JwtPayload | null {
    try {
      return jwt.verify(token, JWT_SECRET) as JwtPayload;
    } catch {
      return null;
    }
  }

  //use on logouts
  async revokeRefreshToken(token: string): Promise<RefreshToken | null> {
    const refreshToken = await this.verifyRefreshToken(token);
    if (!refreshToken) return null;
    await refreshToken.softRemove();
    return refreshToken;
  }

  async refreshAccessToken(token: string): Promise<string | null> {
    const refreshToken = await RefreshToken.findOne({
      where: {
        token
      }
    });
    if(!refreshToken || refreshToken.expiredAt < new Date()){
      if(refreshToken) await refreshToken.softRemove()
      return null;
    }
    const account = refreshToken.account;
    return this.generateAccessToken(account);
  }

  async getRefreshToken(account: Account): Promise<RefreshToken | null>{
    return await RefreshToken.findOne({
      where: {
        account
      },
    });
  }
}
