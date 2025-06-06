import { Controller, Post, Req, Res } from "routing-controllers";
import { Service } from "typedi";
import { JwtService } from "./jwt.service";
import { Request, Response } from "express";

@Service()
@Controller("/jwt")
export class JwtController {
  constructor(private readonly jwtService: JwtService) {}

  @Post("/refresh-token")
  async refreshToken(@Req() req: Request, @Res() res: Response) {
    const refreshToken = req.cookies?.refreshToken;

    if (!refreshToken) {
      return res.status(401).json({ message: "Refresh token not provided" });
    }

    try {
      const newAccessToken = await this.jwtService.refreshAccessToken(
        refreshToken
      );

      if (!newAccessToken) {
        res.clearCookie("refreshToken", {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "strict",
        });
        return res
          .status(401)
          .json({ message: "Invalid or expired refresh token" });
      }

      return newAccessToken;
    } catch (error) {
      res.clearCookie("refreshToken", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
      });
      return res.status(401).json({ message: "Invalid refresh token" });
    }
  }
}
