import { Module } from '@nestjs/common';
import { TelegramBotUpdate } from './telegram-bot.update';
import { CurrencyModule } from 'src/currency/currency.module';
import { ContactsModule } from 'src/contacts/contacts.module';
import { UsersModule } from 'src/users/users.module';
import { TransactionsModule } from 'src/transactions/transactions.module';
import { TelegramBotService } from './telegram-bot.service';

@Module({
  providers: [TelegramBotUpdate, TelegramBotService],
  imports: [CurrencyModule, ContactsModule, UsersModule, TransactionsModule],
})
export class TelegramBotModule {}
