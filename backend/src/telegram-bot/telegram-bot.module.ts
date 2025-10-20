import { DynamicModule, Module, ModuleMetadata } from '@nestjs/common';
import { TelegramBotUpdate } from './telegram-bot.update';
import { CurrencyModule } from 'src/currency/currency.module';
import { ContactsModule } from 'src/contacts/contacts.module';
import { UsersModule } from 'src/users/users.module';
import { TransactionsModule } from 'src/transactions/transactions.module';
import { TelegramBotService } from './telegram-bot.service';
import { TelegrafModule } from 'nestjs-telegraf';
import { sessionMiddleware } from './session-middleware';
import { I18nService } from '../i18n/i18n.service';

@Module({})
export class TelegramBotModule {
  static register(enabled: boolean = true): DynamicModule {
    const imports: ModuleMetadata['imports'] = [];

    if (!enabled) {
      return {
        module: TelegramBotModule,
        imports,
        providers: [],
      };
    }

    imports.push(
      TelegrafModule.forRoot({
        token: process.env.TELEGRAM_BOT_API_KEY!,
        include: [TelegramBotModule],
        middlewares: [sessionMiddleware],
      }),
      CurrencyModule,
      ContactsModule,
      UsersModule,
      TransactionsModule,
    );

    return {
      providers: [TelegramBotUpdate, TelegramBotService, I18nService],
      imports,
      module: TelegramBotModule,
    };
  }
}
