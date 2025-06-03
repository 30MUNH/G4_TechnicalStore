import { Repository } from "typeorm";
import { Account } from "./account.entity";

export class AccountRepository{
    async getAllAccounts(){
        return Account.find();
    }
}