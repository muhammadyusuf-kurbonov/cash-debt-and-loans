import { Module } from '@nestjs/common';
import { TelegramBotUpdate } from './telegram-bot.update';
import { BalanceListScene } from './scenes/inline/balance_list_scene';
import { CurrencyModule } from 'src/currency/currency.module';
import { ContactsModule } from 'src/contacts/contacts.module';
import { UsersModule } from 'src/users/users.module';
import { TransactionsModule } from 'src/transactions/transactions.module';

@Module({
  providers: [TelegramBotUpdate, BalanceListScene],
  imports: [CurrencyModule, ContactsModule, UsersModule, TransactionsModule],
})
export class TelegramBotModule {}
