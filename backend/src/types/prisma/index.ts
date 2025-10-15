import { UserRelations as _UserRelations } from './user_relations';
import { CurrencyRelations as _CurrencyRelations } from './currency_relations';
import { BalanceRelations as _BalanceRelations } from './balance_relations';
import { TransactionRelations as _TransactionRelations } from './transaction_relations';
import { ContactRelations as _ContactRelations } from './contact_relations';
import { User as _User } from './user';
import { Currency as _Currency } from './currency';
import { Balance as _Balance } from './balance';
import { Transaction as _Transaction } from './transaction';
import { Contact as _Contact } from './contact';

export namespace PrismaModel {
  export class UserRelations extends _UserRelations {}
  export class CurrencyRelations extends _CurrencyRelations {}
  export class BalanceRelations extends _BalanceRelations {}
  export class TransactionRelations extends _TransactionRelations {}
  export class ContactRelations extends _ContactRelations {}
  export class User extends _User {}
  export class Currency extends _Currency {}
  export class Balance extends _Balance {}
  export class Transaction extends _Transaction {}
  export class Contact extends _Contact {}

  export const extraModels = [
    UserRelations,
    CurrencyRelations,
    BalanceRelations,
    TransactionRelations,
    ContactRelations,
    User,
    Currency,
    Balance,
    Transaction,
    Contact,
  ];
}
