import { v4 as uuidv4 } from 'uuid';
import BankAccount from '@/models/bank-account';
import type { BankAccountId, BankId, UserId } from '@/types/Common';
import GlobalRegistry from '@/services/GlobalRegistry';
import TransactionService from '@/services/TransactionService';

interface BankOptions {
  isNegativeAllowed?: boolean;
}

export default class Bank {
  private readonly id: BankId;
  private readonly isNegativeAllowed: boolean;
  private readonly accountIds: Set<BankAccountId>;

  private constructor(id: BankId, options?: BankOptions) {
    this.id = id;
    this.isNegativeAllowed = options?.isNegativeAllowed ?? false;
    this.accountIds = new Set<BankAccountId>();
  }

  static create(options?: BankOptions): Bank {
    const bank = new Bank(uuidv4(), options);
    GlobalRegistry.registerBank(bank);
    return bank;
  }

  getId(): BankId {
    return this.id;
  }

  createAccount(initialBalance = 0): BankAccount {
    const account = BankAccount.create(this.id, initialBalance, {
      isNegativeAllowed: this.isNegativeAllowed
    });
    this.accountIds.add(account.getId());
    GlobalRegistry.registerAccount(account);
    return account;
  }

  getAccount(accountId: BankAccountId): BankAccount {
    if (!this.accountIds.has(accountId)) {
      throw new Error('Bank account not found');
    }
    return GlobalRegistry.getAccount(accountId);
  }

  send(fromUserId: UserId, toUserId: UserId, amount: number, toBankId?: BankId): void {
    TransactionService.transfer(this.id, fromUserId, toUserId, amount, toBankId);
  }
}
