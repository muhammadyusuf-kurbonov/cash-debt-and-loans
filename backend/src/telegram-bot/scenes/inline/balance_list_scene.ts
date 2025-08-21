import { Inject } from '@nestjs/common';
import { Balance, Currency } from 'generated/prisma';
import { Ctx, Scene, SceneEnter } from 'nestjs-telegraf';
import { ContactsService } from 'src/contacts/contacts.service';
import { CurrencyService } from 'src/currency/currency.service';
import { asList, asSection } from 'src/telegram-bot/text-format';
import { UsersService } from 'src/users/users.service';
import { formatCurrency } from 'src/utils';
import { SceneContext } from 'telegraf/typings/scenes';

@Scene('balance_scene')
export class BalanceListScene {
  constructor(
    @Inject() private currencyService: CurrencyService,
    @Inject() private usersService: UsersService,
    @Inject() private contactsService: ContactsService,
  ) {}

  formatBalance(balance: Balance & { currency: Currency }) {
    return `${formatCurrency(balance.amount)} ${balance.currency.symbol}`;
  }

  @SceneEnter()
  async enter(@Ctx() context: SceneContext) {
    const user = await this.usersService.getUserByTGId(context.from!.id);
    const netBalances = await this.usersService.getNetBalanceOfUser(user.id);
    const withCurrnecy = await Promise.all(
      netBalances.map(async (balance) => ({
        ...balance,
        currency: await this.currencyService.findOne(balance.currency_id),
      })),
    );

    const balancesText = asSection({
      title: 'Net Balance',
      items: [
        asList({
          sep: '\n',
          items: withCurrnecy.map(
            (balance) =>
              `${formatCurrency(balance._sum.amount ?? 0)} ${balance.currency?.symbol}`,
          ),
        }),
      ],
    });

    const recentContacts = await this.contactsService.getRecentContacts(
      user.id,
      5,
      0,
    );

    const recentText = asSection({
      items: [
        asList({
          items: recentContacts.map(
            (contact) =>
              `${contact.name}\t` +
              contact.Balance.map((balance) =>
                this.formatBalance(balance),
              ).join('\n'),
          ),
        }),
      ],
      title: 'Recent contacts:',
    });

    const result = asList({
      items: [balancesText, recentText],
      sep: '\n\n',
    }).asKwargs();

    await context.reply(result.text, {
      // @ts-expect-error Some TS errors
      entities: result.entities,
    });
  }
}
