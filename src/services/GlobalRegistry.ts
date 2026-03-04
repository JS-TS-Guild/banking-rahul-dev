import type Bank from '@/models/bank';
import type BankAccount from '@/models/bank-account';
import type User from '@/models/user';
import type { BankAccountId, BankId, UserId } from '@/types/Common';

export default class GlobalRegistry {
  private static banks = new Map<BankId, Bank>();
  private static users = new Map<UserId, User>();
  private static accounts = new Map<BankAccountId, BankAccount>();

  static registerBank(bank: Bank): void {
    this.banks.set(bank.getId(), bank);
  }

  static registerUser(user: User): void {
    this.users.set(user.getId(), user);
  }

  static registerAccount(account: BankAccount): void {
    this.accounts.set(account.getId(), account);
  }

  static getBank(bankId: BankId): Bank {
    const bank = this.banks.get(bankId);
    if (!bank) {
      throw new Error('Bank not found');
    }
    return bank;
  }

  static getUser(userId: UserId): User {
    const user = this.users.get(userId);
    if (!user) {
      throw new Error('User not found');
    }
    return user;
  }

  static getAccount(accountId: BankAccountId): BankAccount {
    const account = this.accounts.get(accountId);
    if (!account) {
      throw new Error('Bank account not found');
    }
    return account;
  }

  static clear(): void {
    this.banks.clear();
    this.users.clear();
    this.accounts.clear();
  }
}
