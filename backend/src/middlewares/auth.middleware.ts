// src/middleware/Auth.ts
import { ExpressMiddlewareInterface } from "routing-controllers";
import { Request, Response, NextFunction } from "express";
import { Service } from "typedi";
import { JwtService } from "../auth/jwt/jwt.service";
import { AccountDetailsDto } from "@/auth/dtos/account.dto";
import { HttpException } from "@/exceptions/http-exceptions";
import { HttpMessages } from "@/exceptions/http-messages.constant";

interface RequestWithUser extends Request {
  user?: AccountDetailsDto;
}

@Service()
export class Auth implements ExpressMiddlewareInterface {
  constructor(private readonly jwtService: JwtService) {}

  use(req: RequestWithUser, res: Response, next: NextFunction): any {
    const token = req.header("Authorization");

    if (!token) {
      return next(new HttpException(401, HttpMessages._UNAUTHORIZED));
    }

    try {
      const payload = this.jwtService.verifyAccessToken(
        token
      ) as AccountDetailsDto | null;
      if (!payload) {
        return next(new HttpException(401, HttpMessages._UNAUTHORIZED));
      }
      req.user = payload;
      return next();
    } catch (err) {
      console.error('JWT verification error:', err);
      return next(new HttpException(401, HttpMessages._UNAUTHORIZED));
    }
  }
}

export function authorizedRoles(...allowedRoles: string[]) {
  return (req: RequestWithUser, res: Response, next: NextFunction) => {
    const user = req.user;
    if (!user || !user.role || !user.role.name) {
      return next(new HttpException(403, "Forbidden"));
    }
    if (!allowedRoles.includes(user.role.name)) {
      return next(new HttpException(403, "Forbidden"));
    }
    next();
  };
}
