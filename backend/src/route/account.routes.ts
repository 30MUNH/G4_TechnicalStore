import { Router } from 'express';
import { getAccounts, createAccount } from '../controller/account.controller';

const router = Router();

router.get('/', getAccounts);
router.post('/', createAccount);

export default router;
