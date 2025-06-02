import { Request, Response } from 'express';
import { Account } from '../account/account.entity';
import { AppDataSource } from '../database/dbConnection';

export const getAccounts = async (_req: Request, res: Response) => {
// await AppDataSource.initialize(); 
  const accountRepo = AppDataSource.getRepository(Account);
  const accounts = await accountRepo.find({ relations: ['role'] });
  res.json(accounts);
};

export const createAccount = async (req: Request, res: Response) => {
  const { username, password, roleId } = req.body;

  const account = new Account();
  account.username = username;
  account.password = password;
  account.role = { id: roleId } as any;

  const accountRepo = AppDataSource.getRepository(Account);
  const saved = await accountRepo.save(account);
  res.status(201).json(saved);
};
