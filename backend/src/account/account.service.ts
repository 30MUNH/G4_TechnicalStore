import { Service } from "typedi";
import { Account } from "./account.entity";

@Service()
export class AccountService{
    async createAccount(username: string, password: string){
        const account = new Account();
        account.username = username;
        account.password = password;
        await account.save();
    }
}