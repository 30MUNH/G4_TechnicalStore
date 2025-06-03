import { Service } from 'typedi';
import {
  JsonController,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  HttpCode,
  OnUndefined,
} from 'routing-controllers';
import { Inject } from 'typedi';
import { UserManagementService } from './userManagement.service';
import { CreateAccountDto, LoginDto, UpdateAccountDto } from '../userManagement/dtos/updateAccount.dto';
import { Account } from '../auth/account/account.entity';
import { AccountNotFoundException } from '@/exceptions/http-exceptions';

@Service()
@JsonController('/userManagement')
export class AccountController {
  constructor(
    @Inject(() => UserManagementService)
    private readonly userManagementService: UserManagementService,
  ) {}

  @Post()
  @HttpCode(201)
  async create(@Body() body: CreateAccountDto): Promise<Account> {
    return this.userManagementService.createAccount(body);
  }

  @Get()
  async findAll(): Promise<Account[]> {
    return this.userManagementService.getAllAccounts();
  }

  @Get('/:id')
  async findOne(@Param('id') id: string): Promise<Account> {
    return this.userManagementService.getAccountById(id);
  }

  @Put('/:id')
  async update(@Param('id') id: string, @Body() body: UpdateAccountDto): Promise<Account> {
    return this.userManagementService.updateAccount(id, body);
  }

  @Delete('/:id')
  @OnUndefined(204)
  async delete(@Param('id') id: string): Promise<void> {
    await this.userManagementService.deleteAccount(id);
  }
}
