import { Ctx, InlineQuery, Start, Update } from 'nestjs-telegraf';
import { Scenes } from 'telegraf';

@Update()
export class TelegramBotUpdate {
  @Start()
  onStart(): string {
    return 'Say hello to me';
  }

  @InlineQuery(/^-?\d+(\.\d+)?$/)
  async onAmount(@Ctx() context: Scenes.SceneContext) {
    await context.scene.enter('byAmount');
  }
}
