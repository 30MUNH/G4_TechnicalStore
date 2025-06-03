import { Body, BodyParam, Controller, Post } from "routing-controllers";
import { Service } from "typedi";
import { AccountService } from "./account.service";
import { CreateAccountDto, LoginDto } from "../dtos/account.dto";

@Service()
@Controller("/account")
export class AccountController{
    constructor(
        private accountService: AccountService
    ){}

    @Post()
    async createAccount(@Body() body: CreateAccountDto){
        return await this.accountService.createAccount(body);
    }

    @Post('/login')
    async login(@Body() body: LoginDto){
        return await this.accountService.login(body);
    }
}