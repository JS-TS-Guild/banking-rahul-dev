import type BankAccount from '@/models/bank-account';
import type { BankId, UserId } from '@/types/Common';
import GlobalRegistry from '@/services/GlobalRegistry';

export default class TransactionService {
  static transfer(
    fromBankId: BankId,
    fromUserId: UserId,
    toUserId: UserId,
    amount: number,
    toBankId?: BankId
  ): void {
    if (amount <= 0) {
      throw new Error('Amount should be greater than zero');
    }

    const sourceBankId = fromBankId;
    const targetBankId = toBankId ?? fromBankId;
    const isSelfTransfer = fromUserId === toUserId;

    const fromUser = GlobalRegistry.getUser(fromUserId);
    const toUser = GlobalRegistry.getUser(toUserId);

    // Validate banks exist before continuing transfer.
    GlobalRegistry.getBank(sourceBankId);
    GlobalRegistry.getBank(targetBankId);

    const sourceAccounts = this.pickSourceAccounts(fromUser.getAccountIds(), sourceBankId);
    const targetAccount = this.pickTargetAccount(
      toUser.getAccountIds(),
      targetBankId,
      isSelfTransfer ? sourceAccounts[0]?.getId() : undefined
    );

    this.debitAcrossAccounts(sourceAccounts, amount);
    targetAccount.credit(amount);
  }

  static send(
    fromBankId: BankId,
    fromUserId: UserId,
    toUserId: UserId,
    amount: number,
    toBankId?: BankId
  ): void {
    this.transfer(fromBankId, fromUserId, toUserId, amount, toBankId);
  }

  private static pickSourceAccounts(accountIds: string[], sourceBankId: BankId): BankAccount[] {
    const sourceAccounts = accountIds
      .map((accountId) => GlobalRegistry.getAccount(accountId))
      .filter((account) => account.getBankId() === sourceBankId);

    if (sourceAccounts.length === 0) {
      throw new Error('Insufficient funds');
    }

    return sourceAccounts;
  }

  private static debitAcrossAccounts(sourceAccounts: BankAccount[], amount: number): void {
    let remaining = amount;

    for (const account of sourceAccounts) {
      if (remaining <= 0) {
        break;
      }

      if (account.canDebit(remaining)) {
        remaining = 0;
        continue;
      }

      const available = account.getBalance();
      if (available > 0) {
        remaining -= Math.min(available, remaining);
      }
    }

    if (remaining > 0) {
      throw new Error('Insufficient funds');
    }

    remaining = amount;
    for (const account of sourceAccounts) {
      if (remaining <= 0) {
        break;
      }

      if (account.canDebit(remaining)) {
        account.debit(remaining);
        remaining = 0;
        break;
      }

      const available = account.getBalance();
      if (available > 0) {
        const debitAmount = Math.min(available, remaining);
        account.debit(debitAmount);
        remaining -= debitAmount;
      }
    }
  }

  private static pickTargetAccount(
    accountIds: string[],
    targetBankId: BankId,
    excludedAccountId?: string
  ): BankAccount {
    for (const accountId of accountIds) {
      const account = GlobalRegistry.getAccount(accountId);
      if (account.getBankId() === targetBankId && account.getId() !== excludedAccountId) {
        return account;
      }
    }

    throw new Error('Target account not found');
  }
}
