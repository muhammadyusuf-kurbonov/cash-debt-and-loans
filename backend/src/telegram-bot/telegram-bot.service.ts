import { Inject, Injectable } from '@nestjs/common';
import { InjectBot } from 'nestjs-telegraf';
import { ContactsService } from 'src/contacts/contacts.service';
import { CurrencyService } from 'src/currency/currency.service';
import { TransactionsService } from 'src/transactions/transactions.service';
import { UsersService } from 'src/users/users.service';
import { formatCurrency, formatBalance } from 'src/utils';
import { Telegraf } from 'telegraf';
import { asSection, asList, Text, Pre, Bold } from './text-format';

@Injectable()
export class TelegramBotService {
  constructor(
    @InjectBot() private readonly bot: Telegraf,
    @Inject() private currencyService: CurrencyService,
    @Inject() private usersService: UsersService,
    @Inject() private contactsService: ContactsService,
    @Inject() private transactionsService: TransactionsService,
  ) {}

  async getBalancesTotal(userTGId: number): Promise<Text> {
    const user = await this.usersService.getUserByTGId(userTGId);
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
              contact.Balance.map((balance) => formatBalance(balance)).join(
                '\n',
              ),
          ),
        }),
      ],
      title: 'Recent contacts:',
    });

    return asList({
      items: [balancesText, recentText],
      sep: '\n\n',
    });
  }

  async getCustomerDetailsByName(
    userTGId: number,
    contactName: string,
  ): Promise<Text> {
    const user = await this.usersService.getUserByTGId(userTGId);
    const contact = await this.contactsService.getContactByName(
      user.id,
      contactName,
    );

    if (!contact) {
      return new Text('Contact not found');
    }

    return await this.getCustomerDetails(userTGId, contact.id);
  }

  private async getCustomerDetails(
    userTGId: number,
    contactId: number,
  ): Promise<Text> {
    const user = await this.usersService.getUserByTGId(userTGId);
    const contact = await this.contactsService.findOne(contactId, user.id);

    const balancesText = asSection({
      title: 'Balance',
      items: [
        asList({
          sep: '\n',
          items: contact.Balance.map(
            (balance) =>
              `${formatCurrency(balance.amount ?? 0)} ${balance.currency?.symbol}`,
          ),
        }),
      ],
    });

    const recentTransactions =
      await this.transactionsService.getRecentOperations(
        contactId,
        user.id,
        5,
        0,
      );

    const recentText = asSection({
      items: [
        new Pre(
          'markdown',
          asList({
            items: recentTransactions.map(
              (transaction) =>
                `${transaction.createdAt.toLocaleString('ru-RU', { timeStyle: 'short', dateStyle: 'medium' })}\t|\t${transaction.amount} ${transaction.currency.symbol}`,
            ),
          }),
        ),
      ],
      title: 'Recent operations:',
    });

    return asList({
      items: [new Bold(contact.name ?? ''), balancesText, recentText],
      sep: '\n\n',
    });
  }
}
