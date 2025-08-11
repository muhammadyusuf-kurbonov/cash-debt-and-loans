import { Module } from '@nestjs/common';
import { TelegramBotUpdate } from './telegram-bot.update';
import { QueryByAmountScene } from './scenes/inline/by_amount';

@Module({
  providers: [TelegramBotUpdate, QueryByAmountScene],
})
export class TelegramBotModule {}
