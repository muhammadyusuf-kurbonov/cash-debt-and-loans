import {
  BadRequestException,
  ForbiddenException,
  Inject,
} from '@nestjs/common';
import { Action, Command, Ctx, InlineQuery, On, Update } from 'nestjs-telegraf';
import { ContactsService } from 'src/contacts/contacts.service';
import { UsersService } from 'src/users/users.service';
import { Context, Scenes } from 'telegraf';
import {
  CallbackQuery,
  Message,
  Update as TelegramUpdate,
} from 'telegraf/types';
import { I18nService } from '../i18n/i18n.service';
import { TelegramBotService } from './telegram-bot.service';
import { parseQuery } from './utils';
import { formatCurrency } from 'src/utils';

@Update()
export class TelegramBotUpdate {
  constructor(
    @Inject() private contactsService: ContactsService,
    @Inject() private telegramBotService: TelegramBotService,
    @Inject() private i18nService: I18nService,
    @Inject() private usersService: UsersService,
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

    // If this is a balance display result, ignore the chosen_inline_result event.
    // Balances will be shown via explicit callback queries (buttons) that include
    // the target user's Telegram id. This avoids creating draft transactions.
    if (chosenInlineResult.result_id.startsWith('balance_')) {
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
      const formattedAmount = formatCurrency(absAmount);

      const balances = await this.contactsService.getBalance(
        transaction.contact_id ?? 0,
        transaction.user_id,
        transaction.currency_id,
      );
      const currentBalance =
        balances && balances.length ? balances[0].amount : 0;
      const formattedCurrentBalance = formatCurrency(currentBalance);

      await context.editMessageText(
        `
  ✅ ${actionText}: ${formattedAmount} ${transaction.currency.symbol ?? 'currency'}${commentText}

  ${this.i18nService.getTranslation('balance_messages.current_balance')}: ${formattedCurrentBalance} ${transaction.currency.symbol ?? 'у.е.'}

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

  @Action(/^balance_.*/)
  async onBalanceRequest(
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

      // Expected format: balance_<currencyId>_<ownerTgId>
      const payload = callbackData.replace('balance_', '');
      const parts = payload.split('_');
      const currencyId = parts[0] ? parseInt(parts[0], 10) : NaN;
      const ownerTgId = parts[1] ? parseInt(parts[1], 10) : NaN;

      if (Number.isNaN(currencyId) || Number.isNaN(ownerTgId)) {
        await context.answerCbQuery('Invalid data');
        return;
      }

      const requesterTgId = context.from.id;

      // Forbid author clicking their own button
      if (requesterTgId === ownerTgId) {
        await context.answerCbQuery(
          this.i18nService.getTranslation('errors.self_transaction'),
        );
        return;
      }

      // Map telegram ids to internal user ids
      const ownerUser = await this.usersService.getUserByTGId(ownerTgId);
      const contactUser = await this.usersService.getUserByTGId(requesterTgId);

      // Ensure contact exists (creates if needed)
      const contact = await this.contactsService.getContactForUserId(
        contactUser.id,
        ownerUser.id,
      );

      const balances = await this.contactsService.getBalance(
        contact.id,
        ownerUser.id,
        currencyId,
      );

      const amount = balances && balances.length ? balances[0].amount : 0;
      let symbol = '';
      if (balances && balances.length) {
        symbol = balances[0].currency.symbol;
      }
      const formatted = formatCurrency(amount);

      await context.answerCbQuery();
      await context.editMessageReplyMarkup({ inline_keyboard: [] });
      await context.editMessageText(
        `${this.i18nService.getTranslation('commands.balance_title', this.i18nService.getUserLanguage(ownerTgId))}: ${formatted} ${symbol}`,
      );
    } catch (error) {
      console.error('Error handling balance callback:', error);
      await context.answerCbQuery('Failed to fetch balance');
    }
  }
}
