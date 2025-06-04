import { Service } from "typedi";
import { Account } from "./account.entity";
import { Role } from "@/auth/role/role.entity";
import { AccountNotFoundException, EntityNotFoundException, HttpException } from "@/exceptions/http-exceptions";
import * as bcrypt from 'bcrypt';
import { AccountDetailsDto, CreateAccountDto, LoginDto } from "../dtos/account.dto";
import { JwtService } from "../jwt/jwt.service";

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
        await account.save();
        return account;
    }

    async login(credentials: LoginDto): Promise<Account>{
        const account = await Account.findOne({
            where:{
                username: credentials.username,
            }
        });
        if(!account || !(await bcrypt.compare(credentials.password, account.password))) throw new AccountNotFoundException();
        const accountDetails: AccountDetailsDto = {
            username: account.username,
            phone: account.phone,
            role: account.role
        };
        const refreshToken = this.jwtService.generateAccessToken(accountDetails);
        return account;
    }

    async viewAccountDetails(username: string): Promise<Account>{
        const account = await Account.findOne({
            where: {
                username
            }
        });
        if(!account) throw new AccountNotFoundException();
        return account;
    }
}