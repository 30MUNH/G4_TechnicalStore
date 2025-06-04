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
  generateAccessToken(payload: AccountDetailsDto): string {
    return jwt.sign(payload, JWT_SECRET, { expiresIn: "1d" });
  }

  async generateRefreshToken(payload: AccountDetailsDto): Promise<string> {
    const token = jwt.sign(payload, REFRESH_TOKEN_SECRET, { expiresIn: "7d" });
    const account = await Account.findOne({
      where: {
        username: payload.username,
      },
    });
    if (!account) throw new AccountNotFoundException();
    const oldRefreshToken = await RefreshToken.find({
      where: {
        account,
      },
    });
    if (oldRefreshToken.length > 0) {
      await Promise.all(oldRefreshToken.map((t) => t.softRemove));
    }
    const refreshToken = new RefreshToken();
    refreshToken.token = token;
    refreshToken.account = account;
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
          username: decoded.username,
        },
      });
      if (!account) throw new AccountNotFoundException();
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
}
