import { Inject } from '@nestjs/common';
import { Ctx, Scene, SceneEnter } from 'nestjs-telegraf';
import { ContactsService } from 'src/contacts/contacts.service';
import { CurrencyService } from 'src/currency/currency.service';
import { TransactionsService } from 'src/transactions/transactions.service';
import { UsersService } from 'src/users/users.service';
import { SceneContext } from 'telegraf/typings/scenes';

@Scene('byAmount')
export class QueryByAmountScene {
  constructor(
    @Inject() private currencyService: CurrencyService,
    @Inject() private usersService: UsersService,
    @Inject() private contactsService: ContactsService,
    @Inject() private transactionsService: TransactionsService,
  ) {}

  @SceneEnter()
  async enter(@Ctx() context: SceneContext) {}
}
