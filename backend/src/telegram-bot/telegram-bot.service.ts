import { Inject, Injectable } from '@nestjs/common';
import { InjectBot } from 'nestjs-telegraf';
import { ContactsService } from 'src/contacts/contacts.service';
import { CurrencyService } from 'src/currency/currency.service';
import { TransactionsService } from 'src/transactions/transactions.service';
import { UsersService } from 'src/users/users.service';
import { formatCurrency, formatBalance } from 'src/utils';
import { Telegraf } from 'telegraf';
import { asSection, asList, Text, Pre, Bold } from './text-format';
import { I18nService, Language } from '../i18n/i18n.service';

@Injectable()
export class TelegramBotService {
  constructor(
    @InjectBot() private readonly bot: Telegraf,
    @Inject() private currencyService: CurrencyService,
    @Inject() private usersService: UsersService,
    @Inject() private contactsService: ContactsService,
    @Inject() private transactionsService: TransactionsService,
    @Inject() private i18nService: I18nService,
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

    const lang = this.i18nService.getUserLanguage(userTGId);
    const balancesText = asSection({
      title: this.i18nService.getTranslation('commands.balance_title', lang),
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
      title: this.i18nService.getTranslation('commands.recent_contacts_title', lang),
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
      const lang = this.i18nService.getUserLanguage(userTGId);
      return new Text(this.i18nService.getTranslation('errors.contact_not_found', lang));
    }

    return await this.getCustomerDetails(userTGId, contact.id);
  }

  private async getCustomerDetails(
    userTGId: number,
    contactId: number,
  ): Promise<Text> {
    const user = await this.usersService.getUserByTGId(userTGId);
    const contact = await this.contactsService.findOne(contactId, user.id);

    const lang = this.i18nService.getUserLanguage(userTGId);
    const balancesText = asSection({
      title: this.i18nService.getTranslation('commands.balance', lang),
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
                `${transaction.createdAt.toLocaleString(this.i18nService.getTranslation('formatting.date_locale', lang), { timeStyle: 'short', dateStyle: 'medium' })}\t|\t${transaction.amount} ${transaction.currency.symbol}`,
            ),
          }),
        ),
      ],
      title: this.i18nService.getTranslation('commands.recent_operations_title', lang),
    });

    return asList({
      items: [new Bold(contact.name ?? ''), balancesText, recentText],
      sep: '\n\n',
    });
  }
}
