import { v4 as uuidv4 } from 'uuid';
import type { BankAccountId, BankId } from '@/types/Common';

interface BankAccountOptions {
  isNegativeAllowed?: boolean;
}

export default class BankAccount {
  private readonly id: BankAccountId;
  private readonly bankId: BankId;
  private balance: number;
  private readonly isNegativeAllowed: boolean;

  private constructor(
    id: BankAccountId,
    bankId: BankId,
    initialBalance: number,
    options?: BankAccountOptions
  ) {
    this.id = id;
    this.bankId = bankId;
    this.balance = initialBalance;
    this.isNegativeAllowed = options?.isNegativeAllowed ?? false;
  }

  static create(bankId: BankId, initialBalance = 0, options?: BankAccountOptions): BankAccount {
    return new BankAccount(uuidv4(), bankId, initialBalance, options);
  }

  getId(): BankAccountId {
    return this.id;
  }

  getBankId(): BankId {
    return this.bankId;
  }

  getBalance(): number {
    return this.balance;
  }

  canDebit(amount: number): boolean {
    if (amount < 0) {
      return false;
    }
    if (this.isNegativeAllowed) {
      return true;
    }
    return this.balance >= amount;
  }

  credit(amount: number): void {
    if (amount <= 0) {
      throw new Error('Amount should be greater than zero');
    }
    this.balance += amount;
  }

  debit(amount: number): void {
    if (amount <= 0) {
      throw new Error('Amount should be greater than zero');
    }
    if (!this.canDebit(amount)) {
      throw new Error('Insufficient funds');
    }
    this.balance -= amount;
  }
}
