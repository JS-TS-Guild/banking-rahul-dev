import { v4 as uuidv4 } from 'uuid';
import type { BankAccountId, UserId } from '@/types/Common';
import GlobalRegistry from '@/services/GlobalRegistry';

export default class User {
  private readonly id: UserId;
  private readonly name: string;
  private readonly accountIds: BankAccountId[];

  private constructor(id: UserId, name: string, accountIds: BankAccountId[]) {
    this.id = id;
    this.name = name;
    this.accountIds = accountIds;
  }

  static create(name: string, accountIds: BankAccountId[]): User {
    const user = new User(uuidv4(), name, [...accountIds]);
    GlobalRegistry.registerUser(user);
    return user;
  }

  getId(): UserId {
    return this.id;
  }

  getName(): string {
    return this.name;
  }

  getAccountIds(): BankAccountId[] {
    return [...this.accountIds];
  }
}
