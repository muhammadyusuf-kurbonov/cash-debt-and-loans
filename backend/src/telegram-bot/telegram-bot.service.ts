import {
  BadRequestException,
  ForbiddenException,
  Inject,
  Injectable,
} from '@nestjs/common';
import { ContactsService } from 'src/contacts/contacts.service';
import { CurrencyService } from 'src/currency/currency.service';
import { TransactionsService } from 'src/transactions/transactions.service';
import { UsersService } from 'src/users/users.service';
import { formatBalance, formatCurrency } from 'src/utils';
import { Context } from 'telegraf';
import { InlineQueryResultArticle } from 'telegraf/types';
import { I18nService } from '../i18n/i18n.service';
import { asList, asSection, Bold, Pre, Text } from './text-format';
import { parseQuery } from './utils';
import { ContactsAttachService } from 'src/contacts/contact-attach.service';

@Injectable()
export class TelegramBotService {
  constructor(
    @Inject() private currencyService: CurrencyService,
    @Inject() private usersService: UsersService,
    @Inject() private contactsService: ContactsService,
    @Inject() private contactsAttachService: ContactsAttachService,
    @Inject() private transactionsService: TransactionsService,
    @Inject() private i18nService: I18nService,
  ) {}

  async handleMainInlineQuery(
    query: string,
    author: Context['from'],
  ): Promise<InlineQueryResultArticle[]> {
    if (!author) {
      throw new BadRequestException();
    }

    const lang = this.i18nService.getUserLanguage(author.id);

    const { amount, comment } = parseQuery(query);
    if (isNaN(amount)) {
      return [
        {
          id: 'error',
          input_message_content: {
            message_text: '',
          },
          title: this.i18nService.getTranslation('error_amount', lang),
          type: 'article',
        },
      ];
    }

    const formatted = this.i18nService.getIntlNumberFormat(lang).format(amount);

    const currencies = await this.currencyService.findAll();

    if (currencies.length === 0) {
      const defaultCurrency = await this.currencyService.create('UZS', "So'm");
      currencies.push(defaultCurrency);
    }

    await this.usersService.getUserByTGId(
      author.id,
      `${author.first_name} ${author.last_name ?? ''}`,
    );

    const result: InlineQueryResultArticle[] = [];
    // Create draft transactions for each currency
    for (const currency of currencies) {
      // Format the display message with the comment
      const displayMessage = comment
        ? `${this.i18nService.getTranslation('actions.received', lang)} ${formatted} ${currency.name} with comment: "${comment}". ${this.i18nService.getTranslation('actions.please_confirm', lang)}`
        : `${this.i18nService.getTranslation('actions.received', lang)} ${formatted} ${currency.name}. ${this.i18nService.getTranslation('actions.please_confirm', lang)}`;

      const withdrawMessage = comment
        ? `${this.i18nService.getTranslation('actions.sent', lang)} ${formatted} ${currency.name} with comment: "${comment}". ${this.i18nService.getTranslation('actions.please_confirm', lang)}`
        : `${this.i18nService.getTranslation('actions.sent', lang)} ${formatted} ${currency.name}. ${this.i18nService.getTranslation('actions.please_confirm', lang)}`;

      result.push(
        {
          id: `topup_${currency.id}`,
          type: 'article',
          title: `${this.i18nService.getTranslation('actions.received', lang)} ${formatted} ${currency.symbol}${comment ? ` (${comment})` : ''}`,
          input_message_content: {
            message_text: displayMessage,
          },
          reply_markup: {
            inline_keyboard: [
              [
                {
                  text: this.i18nService.getTranslation(
                    'actions.confirm',
                    lang,
                  ),
                  callback_data: `confirm_transaction`,
                },
                {
                  text: this.i18nService.getTranslation('actions.cancel', lang),
                  callback_data: `cancel`,
                },
              ],
            ],
          },
        } satisfies InlineQueryResultArticle,
        {
          id: `withdraw_${currency.id}`,
          type: 'article',
          title: `${this.i18nService.getTranslation('actions.sent', lang)} ${formatted} ${currency.name}${comment ? ` (${comment})` : ''}`,
          input_message_content: {
            message_text: withdrawMessage,
          },
          reply_markup: {
            inline_keyboard: [
              [
                {
                  text: this.i18nService.getTranslation(
                    'actions.confirm',
                    lang,
                  ),
                  callback_data: `confirm_transaction`,
                },
                {
                  text: this.i18nService.getTranslation('actions.cancel', lang),
                  callback_data: `cancel`,
                },
              ],
            ],
          },
        } satisfies InlineQueryResultArticle,
      );
    }

    return result;
  }

  async handleResultSelected(
    inlineQueryId: string,
    type: 'topup' | 'withdraw',
    authorTgId: number,
    amount: number,
    currency_id: number,
    comment?: string,
  ) {
    console.log('Created draft', inlineQueryId, type);
    await this.transactionsService.createDraft(
      inlineQueryId,
      currency_id,
      type === 'topup' ? -amount : amount,
      (await this.usersService.getUserByTGId(authorTgId)).id,
      comment,
    );
  }

  async handleConfirmed(inlineQueryId: string, userTGId: number) {
    console.log('Confirmed draft', inlineQueryId);
    const transaction = await this.transactionsService.getDraft(inlineQueryId);
    if (!transaction) {
      throw new BadRequestException('draft not found');
    }

    const confirmedUser = await this.usersService.getUserByTGId(userTGId);

    if (confirmedUser.id === transaction.user_id) {
      throw new ForbiddenException('You can not confirm your transaction');
    }

    const contact = await this.contactsService.getContactForUserId(
      confirmedUser.id,
      transaction.user_id,
    );
    return await this.transactionsService.finalizeDraft(
      inlineQueryId,
      contact.id,
    );
  }

  async handleCancelled(inlineQueryId: string) {
    return await this.transactionsService.deleteDraft(inlineQueryId);
  }

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
              `${contact?.name}\t` +
              contact?.Balance.map((balance) => formatBalance(balance)).join(
                '\n',
              ),
          ),
        }),
      ],
      title: this.i18nService.getTranslation(
        'commands.recent_contacts_title',
        lang,
      ),
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
      return new Text(
        this.i18nService.getTranslation('errors.contact_not_found', lang),
      );
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
      title: this.i18nService.getTranslation(
        'commands.recent_operations_title',
        lang,
      ),
    });

    return asList({
      items: [new Bold(contact.name ?? ''), balancesText, recentText],
      sep: '\n\n',
    });
  }

  async handleUserToContactAttached(inviteCode: string, userTGId: number) {
    const [contact_id, user_id] = inviteCode.split('-');
    return await this.contactsAttachService.handleContactAttachAccept(
      userTGId,
      +contact_id,
      +user_id,
    );
  }
}
