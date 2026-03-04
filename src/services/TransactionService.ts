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

    const fromUser = GlobalRegistry.getUser(fromUserId);
    const toUser = GlobalRegistry.getUser(toUserId);

    // Validate banks exist before continuing transfer.
    GlobalRegistry.getBank(sourceBankId);
    GlobalRegistry.getBank(targetBankId);

    const sourceAccount = this.pickSourceAccount(fromUser.getAccountIds(), sourceBankId, amount);
    const targetAccount = this.pickTargetAccount(toUser.getAccountIds(), targetBankId);

    sourceAccount.debit(amount);
    targetAccount.credit(amount);
  }

  private static pickSourceAccount(
    accountIds: string[],
    sourceBankId: BankId,
    amount: number
  ): BankAccount {
    const sourceAccounts = accountIds
      .map((accountId) => GlobalRegistry.getAccount(accountId))
      .filter((account) => account.getBankId() === sourceBankId);

    for (const account of sourceAccounts) {
      if (account.canDebit(amount)) {
        return account;
      }
    }

    throw new Error('Insufficient funds');
  }

  private static pickTargetAccount(accountIds: string[], targetBankId: BankId): BankAccount {
    for (const accountId of accountIds) {
      const account = GlobalRegistry.getAccount(accountId);
      if (account.getBankId() === targetBankId) {
        return account;
      }
    }

    throw new Error('Target account not found');
  }
}
