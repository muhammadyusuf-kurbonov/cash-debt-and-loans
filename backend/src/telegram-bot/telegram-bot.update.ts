import { BadRequestException, Inject } from '@nestjs/common';
import {
  InlineQueryResultArticle,
  Update as TelegramUpdate,
} from '@telegraf/types';
import { Action, Ctx, InlineQuery, On, Start, Update } from 'nestjs-telegraf';
import { ContactsService } from 'src/contacts/contacts.service';
import { CurrencyService } from 'src/currency/currency.service';
import { TransactionsService } from 'src/transactions/transactions.service';
import { UsersService } from 'src/users/users.service';
import { Scenes } from 'telegraf';
import { SceneContext } from 'telegraf/typings/scenes';

@Update()
export class TelegramBotUpdate {
  constructor(
    @Inject() private currencyService: CurrencyService,
    @Inject() private usersService: UsersService,
    @Inject() private contactsService: ContactsService,
    @Inject() private transactionsService: TransactionsService,
  ) {}

  @Start()
  onStart(@Ctx() ctx: Scenes.SceneContext) {
    console.log('Hello, I am a Telegram bot!');
    return ctx.reply('Say hello to me');
  }

  @InlineQuery(/^-?\d+(\.\d+)?$/)
  async onAmount(@Ctx() context: Scenes.SceneContext) {
    const inlineQuery = context.inlineQuery;
    if (!inlineQuery) {
      throw new BadRequestException('Некорректный запрос');
    }

    const amount = context.inlineQuery.query;

    const user = await this.usersService.getUserByTGId(inlineQuery.from.id);

    const currencies = await this.currencyService.findAll(user.id);

    if (currencies.length === 0) {
      const defaultCurrency = await this.currencyService.create(
        user.id,
        'UZS',
        "So'm",
      );
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
                title: `Принял ${amount} ${currency.name}`,
                input_message_content: {
                  message_text: `Принял ${amount} ${currency.name}. Пожалуйста, подтвердите операцию.`,
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
                title: `Отправил ${amount} ${currency.name}`,
                input_message_content: {
                  message_text: `Отправил ${amount} ${currency.name}. Пожалуйста, подтвердите операцию.`,
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

  @Action(/cr_.*/)
  async onConfirmReceive(
    @Ctx()
    context: SceneContext & { update: TelegramUpdate.CallbackQueryUpdate },
  ) {
    const cbQuery = context.update.callback_query;
    const userAnswer = 'data' in cbQuery ? cbQuery.data : null;

    if (!userAnswer) {
      await context.answerCbQuery('Некорректный ответ');
      return;
    }

    const [userId, amount, currencyId] = userAnswer.split('_').slice(1);

    if (context.from?.id === parseInt(userId)) {
      await context.answerCbQuery(
        'Вы не можете создать транзакцию самому себе',
      );
      return;
    }

    const receiver = await this.usersService.getUserByTGId(parseInt(userId));
    const sender = await this.usersService.getUserByTGId(context.from!.id);

    const receiverPartyContact = await this.contactsService.getContactForUserId(
      sender.id,
      receiver.id,
      sender.name ?? context.from?.first_name ?? 'Unknown',
    );

    await this.transactionsService.create(
      receiverPartyContact.id,
      parseInt(currencyId),
      -parseFloat(amount),
    );
    await context.answerCbQuery('Транзакция успешно проведена');
    await context.editMessageReplyMarkup({
      inline_keyboard: [],
    });
    const currency = await this.currencyService.findOne(
      parseInt(currencyId),
      receiver.id,
    );
    await context.editMessageText(
      `✅ Получил сумму: ${amount} ${currency?.symbol ?? 'у.е.'}\n\n\nПодтверждено`,
      { parse_mode: 'MarkdownV2' },
    );
  }
  @Action(/cs_*/g)
  async onConfirmSend(
    @Ctx()
    context: SceneContext & { update: TelegramUpdate.CallbackQueryUpdate },
  ) {
    const cbQuery = context.update.callback_query;
    const userAnswer = 'data' in cbQuery ? cbQuery.data : null;

    if (!userAnswer) {
      await context.answerCbQuery('Некорректный ответ');
      return;
    }

    const [userId, amount, currencyId] = userAnswer.split('_').slice(1);

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
      parseFloat(amount),
    );
    await context.answerCbQuery('Транзакция успешно проведена');
    await context.editMessageReplyMarkup({
      inline_keyboard: [],
    });
    const currency = await this.currencyService.findOne(
      parseInt(currencyId),
      currentUser.id,
    );
    await context.editMessageText(
      `✅ Отправил сумму: ${amount} ${currency?.symbol ?? 'у.е.'}\n\n\nПодтверждено`,
      { parse_mode: 'MarkdownV2' },
    );
  }

  @On('callback_query')
  onCallbackQuery(@Ctx() ctx: Scenes.SceneContext) {
    console.log(ctx.callbackQuery?.from, ctx.scene.current?.id);
  }
}
