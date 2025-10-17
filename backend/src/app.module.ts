import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { ContactsModule } from './contacts/contacts.module';
import { CurrencyModule } from './currency/currency.module';
import { PrismaModule } from './prisma/prisma.module';
import { TelegramBotModule } from './telegram-bot/telegram-bot.module';
import { TransactionsModule } from './transactions/transactions.module';
import { UsersModule } from './users/users.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PrismaModule,
    AuthModule,
    CurrencyModule,
    ContactsModule,
    TransactionsModule,
    UsersModule,
    TelegramBotModule.register(!process.env.TELEGRAM_DISABLED),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
