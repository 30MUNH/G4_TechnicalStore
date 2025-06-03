import { Service } from "typedi";
import { Account } from "./account.entity";
import { Role } from "@/auth/role/role.entity";

@Service()
export class AccountService{
    async createAccount(username: string, password: string, roleSlug: string){
        const role = new Role();
        
        const account = new Account();
        account.username = username;
        account.password = password;
        await account.save();
    }
}