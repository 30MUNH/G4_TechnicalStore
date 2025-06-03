import { Service } from "typedi";
import { Account } from "./account.entity";
import { Role } from "@/auth/role/role.entity";
import { AccountNotFoundException, EntityNotFoundException, HttpException } from "@/exceptions/http-exceptions";
import * as bcrypt from 'bcrypt';
import { CreateAccountDto, LoginDto } from "../dtos/account.dto";

@Service()
export class AccountService{
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
        return account;
    }
}