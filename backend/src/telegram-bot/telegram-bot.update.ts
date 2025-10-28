import {
  BadRequestException,
  ForbiddenException,
  Inject,
} from '@nestjs/common';
import { Action, Command, Ctx, InlineQuery, On, Update } from 'nestjs-telegraf';
import { ContactsService } from 'src/contacts/contacts.service';
import { Context, Scenes } from 'telegraf';
import {
  CallbackQuery,
  Message,
  Update as TelegramUpdate,
} from 'telegraf/types';
import { I18nService } from '../i18n/i18n.service';
import { TelegramBotService } from './telegram-bot.service';
import { parseQuery } from './utils';

@Update()
export class TelegramBotUpdate {
  constructor(
    @Inject() private contactsService: ContactsService,
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

  @On('chosen_inline_result')
  async onChosenInlineResult(@Ctx() context: Scenes.SceneContext) {
    const chosenInlineResult = context.chosenInlineResult;
    if (!chosenInlineResult) {
      throw new BadRequestException('No chosen inline result');
    }

    if (chosenInlineResult.result_id.startsWith('error')) {
      return;
    }

    const { amount, comment } = parseQuery(chosenInlineResult.query);
    const [type, currency_id] = chosenInlineResult.result_id.split('_');

    await this.telegramBotService.handleResultSelected(
      chosenInlineResult.inline_message_id!,
      type as 'topup' | 'withdraw',
      chosenInlineResult.from.id,
      amount,
      parseInt(currency_id),
      comment,
    );
  }

  @InlineQuery(/^-?[\d\s]+(?:\s+.+)?$/) // Matches amounts with optional comments (e.g., "100000 Comment", "100 000 Comment")
  async onQuery(@Ctx() context: Scenes.SceneContext) {
    const inlineQuery = context.inlineQuery!;

    const results = await this.telegramBotService.handleMainInlineQuery(
      inlineQuery.query,
      inlineQuery.from,
    );
    await context.answerInlineQuery(results);
    return;
  }

  @Action('cancel')
  async onCancel(
    @Ctx()
    context: Context<TelegramUpdate.CallbackQueryUpdate>,
  ) {
    await this.telegramBotService
      .handleCancelled(context.inlineMessageId!)
      .catch((error) => console.warn(error));
    await context.answerCbQuery('Transaction cancelled');
    await context.editMessageReplyMarkup({
      inline_keyboard: [],
    });
    await context.editMessageText(
      `❌️ Operation ${context.inlineMessageId} was cancelled`,
    );
  }

  @Action('confirm_transaction')
  async onConfirm(
    @Ctx()
    context: Context,
  ) {
    try {
      const transaction = await this.telegramBotService
        .handleConfirmed(context.inlineMessageId!, context.from!.id)
        .catch((error) => {
          if (error instanceof ForbiddenException) {
            return -1 as const;
          }
          throw error;
        });

      if (transaction === -1) {
        await context.answerCbQuery(
          this.i18nService.getTranslation('errors.self_transaction'),
        );
        return;
      }

      const actionText =
        transaction.amount < 0
          ? this.i18nService.getTranslation('balance_messages.received_amount')
          : this.i18nService.getTranslation('balance_messages.sent_amount');

      const commentText = transaction.note
        ? `\n📝 Comment: ${transaction.note}`
        : '';

      await context.answerCbQuery(
        this.i18nService.getTranslation('success.transaction_completed'),
      );
      await context.editMessageReplyMarkup({
        inline_keyboard: [],
      });
      const absAmount = Math.abs(transaction.amount || 0);
      await context.editMessageText(
        `
  ✅ ${actionText}: ${absAmount} ${transaction.currency.symbol ?? 'currency'}${commentText}

  ${this.i18nService.getTranslation('balance_messages.current_balance')}: ${(await this.contactsService.getBalance(transaction.contact_id ?? 0, transaction.user_id, transaction.currency_id))[0].amount}

  ${this.i18nService.getTranslation('success.confirmed')}`,
      );
    } catch (err) {
      console.error(err);
      await context.answerCbQuery(
        this.i18nService.getTranslation('errors.invalid_response'),
      );
    }
  }

  @Action(/^accept_contact_invite_.*/)
  async onAcceptContactInvite(
    @Ctx()
    context: Context<
      TelegramUpdate.CallbackQueryUpdate<CallbackQuery.DataQuery>
    >,
  ) {
    try {
      const callbackData = context.update.callback_query.data;
      if (!callbackData) {
        await context.answerCbQuery('Invalid request');
        return;
      }

      const inviteCode = callbackData.replace('accept_contact_invite_', '');

      // Process the invite
      await this.telegramBotService.handleUserToContactAttached(
        inviteCode,
        context.from.id,
      );

      await context.answerCbQuery('Contact request accepted!');
      await context.editMessageText(
        '✅ You have successfully accepted the contact request!',
      );
      await context.editMessageReplyMarkup({
        inline_keyboard: [],
      });
    } catch (error) {
      console.error('Error processing contact invite callback:', error);
      await context.answerCbQuery(
        'There was an error processing the request. Please try again.',
      );
    }
  }
}
