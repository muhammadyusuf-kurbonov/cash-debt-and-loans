import { BadRequestException, Inject } from '@nestjs/common';
import { Action, Command, Ctx, InlineQuery, Update } from 'nestjs-telegraf';
import { ContactsService } from 'src/contacts/contacts.service';
import { CurrencyService } from 'src/currency/currency.service';
import { TransactionsService } from 'src/transactions/transactions.service';
import { UsersService } from 'src/users/users.service';
import { Context, Scenes } from 'telegraf';
import {
  InlineQueryResultArticle,
  Message,
  Update as TelegramUpdate,
} from 'telegraf/types';
import { SceneContext } from 'telegraf/typings/scenes';
import { I18nService } from '../i18n/i18n.service';
import { TelegramBotService } from './telegram-bot.service';

@Update()
export class TelegramBotUpdate {
  constructor(
    @Inject() private currencyService: CurrencyService,
    @Inject() private usersService: UsersService,
    @Inject() private contactsService: ContactsService,
    @Inject() private transactionsService: TransactionsService,
    @Inject() private telegramBotService: TelegramBotService,
    @Inject() private i18nService: I18nService,
  ) {}

  @Command('balance')
  async balance(@Ctx() context: Scenes.SceneContext) {
    const result = await this.telegramBotService
      .getBalancesTotal(context.from!.id)
      .then((msg) => msg.asKwargs());
    await context.reply(result.text, {
      // @ts-expect-error Some TS errors
      entities: result.entities,
    });
  }

  @Command('contact')
  async contact(
    @Ctx() context: Context<TelegramUpdate.MessageUpdate<Message.TextMessage>>,
  ) {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [_, contactName] = context.update.message.text.split(' ');

    if (!contactName) {
      const lang = this.i18nService.getUserLanguage(context.from.id);
      void context.reply(
        this.i18nService.getTranslation('commands.contact_format', lang),
        { parse_mode: 'Markdown' },
      );
      return;
    }

    const result = await this.telegramBotService
      .getCustomerDetailsByName(context.from.id, contactName)
      .then((msg) => msg.asKwargs());
    await context.reply(result.text, {
      // @ts-expect-error Some TS errors
      entities: result.entities,
    });
  }

  @InlineQuery(/^-?\d+(\.\d+)?$/)
  async onAmount(@Ctx() context: Scenes.SceneContext) {
    const inlineQuery = context.inlineQuery!;
    const lang = this.i18nService.getUserLanguage(inlineQuery.from.id);

    if (!inlineQuery) {
      throw new BadRequestException(
        this.i18nService.getTranslation('inline_query.invalid_request', lang),
      );
    }

    const amount = context.inlineQuery.query;
    const formatted = this.i18nService
      .getIntlNumberFormat(lang)
      .format(parseFloat(amount));

    const currencies = await this.currencyService.findAll();

    if (currencies.length === 0) {
      const defaultCurrency = await this.currencyService.create('UZS', "So'm");
      currencies.push(defaultCurrency);
    }

    await this.usersService.getUserByTGId(
      inlineQuery.from.id,
      `${inlineQuery.from.first_name} ${inlineQuery.from.last_name ?? ''}`,
    );

    await context.answerInlineQuery(
      currencies
        .map(
          (currency) =>
            [
              {
                id: `topup_${currency.id}_${amount}`,
                type: 'article',
                title: `${this.i18nService.getTranslation('actions.received', lang)} ${formatted} ${currency.name}`,
                input_message_content: {
                  message_text: `${this.i18nService.getTranslation('actions.received', lang)} ${formatted} ${currency.name}. ${this.i18nService.getTranslation('actions.please_confirm', lang)}`,
                },
                reply_markup: {
                  inline_keyboard: [
                    [
                      {
                        text: this.i18nService.getTranslation(
                          'actions.confirm',
                          lang,
                        ),
                        callback_data: `cr_${inlineQuery.from.id}_${amount}_${currency.id}`,
                      },
                      {
                        text: this.i18nService.getTranslation(
                          'actions.cancel',
                          lang,
                        ),
                        callback_data: `cancel`,
                      },
                    ], // Use a unique ID for each inline query result
                  ],
                },
              },
              {
                id: `widraw_${currency.id}_${amount}`,
                type: 'article',
                title: `${this.i18nService.getTranslation('actions.sent', lang)} ${formatted} ${currency.name}`,
                input_message_content: {
                  message_text: `${this.i18nService.getTranslation('actions.sent', lang)} ${formatted} ${currency.name}. ${this.i18nService.getTranslation('actions.please_confirm', lang)}`,
                },
                reply_markup: {
                  inline_keyboard: [
                    [
                      {
                        text: this.i18nService.getTranslation(
                          'actions.confirm',
                          lang,
                        ),
                        callback_data: `cs_${inlineQuery.from.id}_${amount}_${currency.id}`,
                      },
                      {
                        text: this.i18nService.getTranslation(
                          'actions.cancel',
                          lang,
                        ),
                        callback_data: `cancel`,
                      },
                    ], // Use a unique ID for each inline query result
                  ],
                },
              },
            ] satisfies InlineQueryResultArticle[],
        )
        .flat(),
    );
  }

  @Action(/c[r|s]_.*/)
  async onConfirm(
    @Ctx()
    context: SceneContext & { update: TelegramUpdate.CallbackQueryUpdate },
  ) {
    const cbQuery = context.update.callback_query;
    const userAnswer = 'data' in cbQuery ? cbQuery.data : null;

    const lang = this.i18nService.getUserLanguage(context.from!.id);
    if (!userAnswer) {
      await context.answerCbQuery(
        this.i18nService.getTranslation('errors.invalid_response', lang),
      );
      return;
    }

    const [action, userId, amount, currencyId] = userAnswer.split('_');

    if (context.from?.id === parseInt(userId)) {
      await context.answerCbQuery(
        this.i18nService.getTranslation('errors.self_transaction', lang),
      );
      return;
    }

    const currentUser = await this.usersService.getUserByTGId(parseInt(userId));
    const partyUser = await this.usersService.getUserByTGId(
      context.from!.id,
      `${context.from!.first_name} ${context.from!.last_name ?? ''}`,
    );

    const partyContact = await this.contactsService.getContactForUserId(
      partyUser.id,
      currentUser.id,
      partyUser.name ?? context.from?.first_name ?? 'Unknown',
    );

    await this.transactionsService.create(
      partyContact.id,
      parseInt(currencyId),
      parseFloat(amount) * (action === 'cr' ? -1 : 1),
    );
    await context.answerCbQuery(
      this.i18nService.getTranslation('success.transaction_completed', lang),
    );
    await context.editMessageReplyMarkup({
      inline_keyboard: [],
    });
    const currency = await this.currencyService.findOne(parseInt(currencyId));
    const actionText =
      action === 'cr'
        ? this.i18nService.getTranslation(
            'balance_messages.received_amount',
            lang,
          )
        : this.i18nService.getTranslation('balance_messages.sent_amount', lang);

    await context.editMessageText(
      `
✅ ${actionText}: ${amount} ${currency?.symbol ?? 'currency'}

${this.i18nService.getTranslation('balance_messages.current_balance', lang)}: ${(await this.contactsService.getBalance(partyContact.id, currentUser.id, parseInt(currencyId)))[0].amount}

${this.i18nService.getTranslation('success.confirmed', lang)}`,
    );
  }
}
