import { Service } from 'typedi';
import { AppDataSource } from '../database/dbConnection';
import { Account } from '../auth/account/account.entity';
import { Role } from '@/auth/role/role.entity';
import {
  AccountNotFoundException,
  EntityNotFoundException,
} from '@/exceptions/http-exceptions';
import * as bcrypt from 'bcrypt';
import {
  CreateAccountDto,
  LoginDto,
  UpdateAccountDto,
} from './dtos/updateAccount.dto';

@Service()
export class UserManagementService {
  private accountRepo = AppDataSource.getRepository(Account);
  private roleRepo = AppDataSource.getRepository(Role);

  async createAccount(request: CreateAccountDto): Promise<Account> {
    const role = await this.roleRepo.findOne({
      where: { id: request.roleId },
    });
    if (!role) throw new EntityNotFoundException('Role');

    const account = this.accountRepo.create({
      username: request.username,
      password: await bcrypt.hash(request.password, 8),
      role,
    });

    return await this.accountRepo.save(account);
  }

  async getAccountById(id: string): Promise<Account> {
    const account = await this.accountRepo.findOne({
      where: { id },
      relations: ['role'],
    });
    if (!account) throw new AccountNotFoundException();
    return account;
  }

  async getAllAccounts(): Promise<Account[]> {
    return await this.accountRepo.find({ relations: ['role'] });
  }

  async updateAccount(id: string, request: UpdateAccountDto): Promise<Account> {
    const account = await this.getAccountById(id);

    if (request.username) account.username = request.username;
    if (request.password)
      account.password = await bcrypt.hash(request.password, 8);

    if (request.roleId) {
      const role = await this.roleRepo.findOne({
        where: { id: request.roleId },
      });
      if (!role) throw new EntityNotFoundException('Role');
      account.role = role;
    }

    return await this.accountRepo.save(account);
  }

  async deleteAccount(id: string): Promise<void> {
    const account = await this.getAccountById(id);
    await this.accountRepo.remove(account);
  }
}
