// src/middleware/Auth.ts
import { ExpressMiddlewareInterface, Middleware } from 'routing-controllers';
import { Request, Response, NextFunction } from 'express';
import { Inject, Service } from 'typedi';
import { JwtService } from '../auth/jwt/jwt.service';
import { AccountDetailsDto } from '@/auth/dtos/account.dto';


interface RequestWithUser extends Request {
  user?: AccountDetailsDto;
}

@Middleware({ type: 'before' })
@Service()
export class Auth implements ExpressMiddlewareInterface {
  constructor(
    private readonly jwtService: JwtService
  ) {}

  use(req: RequestWithUser, res: Response, next: NextFunction): any {
    // const token =
    //   req.cookies?.accessToken ||
    //   req.headers['authorization']?.split(' ')[1];

    // if (!token) {
    //   return res.status(401).json({ message: 'Missing token' });
    // }

    // try {
    //   const payload = this.jwtService.verifyAccessToken(token) as AccountDetailsDto | null;
    //   if (!payload) {
    //     return res.status(403).json({ message: 'Invalid or expired token' });
    //   }
    //   req.user = payload;
    //   next();
    // } catch (err) {
    //   return res.status(403).json({ message: 'Invalid or expired token' });
    // }
    next();
  }
}
