import { Module } from '@nestjs/common';
import { TelegramBotUpdate } from './telegram-bot.update';
import { QueryByAmountScene } from './scenes/inline/by_amount';
import { CurrencyModule } from 'src/currency/currency.module';
import { ContactsModule } from 'src/contacts/contacts.module';
import { UsersModule } from 'src/users/users.module';
import { TransactionsModule } from 'src/transactions/transactions.module';

@Module({
  providers: [TelegramBotUpdate, QueryByAmountScene],
  imports: [CurrencyModule, ContactsModule, UsersModule, TransactionsModule],
})
export class TelegramBotModule {}
