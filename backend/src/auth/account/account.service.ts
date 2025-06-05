import { Service } from "typedi";
import { Account } from "./account.entity";
import { Role } from "@/auth/role/role.entity";
import { AccountNotFoundException, EntityNotFoundException, TokenNotFoundException } from "@/exceptions/http-exceptions";
import * as bcrypt from 'bcrypt';
import { AccountDetailsDto, CreateAccountDto, CredentialsDto } from "../dtos/account.dto";
import { JwtService } from "../jwt/jwt.service";
import { RefreshToken } from "../jwt/refreshToken.entity";
import { MoreThan } from "typeorm";

@Service()
export class AccountService{
    constructor(
        private readonly jwtService: JwtService
    ){}
    
    async createAccount(request: CreateAccountDto): Promise<Account>{
        const role = await Role.findOne({
            where: {
                slug: request.roleSlug,
            }
        });
        if(role == null) throw new EntityNotFoundException("Role");
        const account = new Account();
        account.username = request.username;
        const saltRounds = 8;
        account.password = await bcrypt.hash(request.password, saltRounds);
        account.role = role;
        account.phone = request.phone;
        await account.save();
        return account;
    }

    async finalizeCreateAccount(username: string){
        const account = await this.findAccountByUsername(username);
        const newRefreshToken = await this.jwtService.generateRefreshToken(account);
        const accessToken = this.jwtService.generateAccessToken(account);
        return {newRefreshToken, accessToken};
    }

    async removeNewAccounts(): Promise<void>{
        const accounts = await Account.find({
            where: {
                isRegistered: false,
            }
        });
        if(accounts.length > 0) await Promise.all(accounts.map((account) => account.softRemove()));
    }

    async login(credentials: CredentialsDto): Promise<string>{
        const account = await this.findAccountByUsername(credentials.username);
        if(!await bcrypt.compare(credentials.password, account.password)) throw new AccountNotFoundException();
        const token = await RefreshToken.findOne({
            where: {
                account,
                expiredAt: MoreThan (new Date()),
            }
        });
        if(!token){
            await this.jwtService.generateRefreshToken(account);
        }
        return this.jwtService.generateAccessToken(account);
    }

    async logout(username: string): Promise<string>{
        const account = await this.findAccountByUsername(username);
        const token = await this.jwtService.getRefreshToken(account);
        if(!token) throw new TokenNotFoundException;
        await token.softRemove();
        return "Logged out";
    }

    async findAccountByUsername(username: string): Promise<Account>{
        const account = await Account.findOne({
            where: {
                username
            }
        });
        if(!account) throw new AccountNotFoundException();
        return account;
    }

    async checkOldPassword(account: Account, oldPassword: string): Promise<boolean>{
        return await bcrypt.compare(account.password, oldPassword);
    }

    async changePassword(account: Account, newPassword: string){
        account.password = newPassword;
        await account.save();
        return account;
    }
}