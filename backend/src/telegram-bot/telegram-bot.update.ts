import { BadRequestException, Inject } from '@nestjs/common';
import {
  InlineQueryResultArticle,
  Message,
  Update as TelegramUpdate,
} from 'telegraf/types';
import { Action, Command, Ctx, InlineQuery, Update } from 'nestjs-telegraf';
import { ContactsService } from 'src/contacts/contacts.service';
import { CurrencyService } from 'src/currency/currency.service';
import { TransactionsService } from 'src/transactions/transactions.service';
import { UsersService } from 'src/users/users.service';
import { Context, Scenes } from 'telegraf';
import { SceneContext } from 'telegraf/typings/scenes';
import { TelegramBotService } from './telegram-bot.service';

@Update()
export class TelegramBotUpdate {
  constructor(
    @Inject() private currencyService: CurrencyService,
    @Inject() private usersService: UsersService,
    @Inject() private contactsService: ContactsService,
    @Inject() private transactionsService: TransactionsService,
    @Inject() private telegramBotService: TelegramBotService,
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
      void context.reply(
        'Команда имеет такой формат `/contact [имя_контакта]`',
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
    const inlineQuery = context.inlineQuery;
    if (!inlineQuery) {
      throw new BadRequestException('Некорректный запрос');
    }

    const amount = context.inlineQuery.query;
    const formatted = Intl.NumberFormat('ru', { style: 'decimal' }).format(
      parseFloat(amount),
    );

    const currencies = await this.currencyService.findAll();

    if (currencies.length === 0) {
      const defaultCurrency = await this.currencyService.create('UZS', "So'm");
      currencies.push(defaultCurrency);
    }

    await context.answerInlineQuery(
      currencies
        .map(
          (currency) =>
            [
              {
                id: `topup_${currency.id}_${amount}`,
                type: 'article',
                title: `Принял ${formatted} ${currency.name}`,
                input_message_content: {
                  message_text: `Принял ${formatted} ${currency.name}. Пожалуйста, подтвердите операцию.`,
                },
                reply_markup: {
                  inline_keyboard: [
                    [
                      {
                        text: 'Подтвердить',
                        callback_data: `cr_${inlineQuery.from.id}_${amount}_${currency.id}`,
                      },
                      {
                        text: 'Отмена',
                        callback_data: `cancel`,
                      },
                    ], // Use a unique ID for each inline query result
                  ],
                },
              },
              {
                id: `widraw_${currency.id}_${amount}`,
                type: 'article',
                title: `Отправил ${formatted} ${currency.name}`,
                input_message_content: {
                  message_text: `Отправил ${formatted} ${currency.name} к ${context.inlineQuery?.id}. Пожалуйста, подтвердите операцию.`,
                },
                reply_markup: {
                  inline_keyboard: [
                    [
                      {
                        text: 'Подтвердить',
                        callback_data: `cs_${inlineQuery.from.id}_${amount}_${currency.id}`,
                      },
                      {
                        text: 'Отмена',
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

    if (!userAnswer) {
      await context.answerCbQuery('Некорректный ответ');
      return;
    }

    const [action, userId, amount, currencyId] = userAnswer.split('_');

    if (context.from?.id === parseInt(userId)) {
      await context.answerCbQuery(
        'Вы не можете создать транзакцию самому себе',
      );
      return;
    }

    const currentUser = await this.usersService.getUserByTGId(parseInt(userId));
    const partyUser = await this.usersService.getUserByTGId(context.from!.id);

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
    await context.answerCbQuery('Транзакция успешно проведена');
    await context.editMessageReplyMarkup({
      inline_keyboard: [],
    });
    const currency = await this.currencyService.findOne(parseInt(currencyId));
    await context.editMessageText(
      `
✅ ${action === 'cr' ? 'Получил' : 'Отправил'} сумму: ${amount} ${currency?.symbol ?? 'у.е.'}

Текущий баланс: ${(await this.contactsService.getBalance(partyContact.id, currentUser.id, parseInt(currencyId)))[0].amount}

Подтверждено`,
    );
  }
}
