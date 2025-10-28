import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectBot } from 'nestjs-telegraf';
import { I18nService } from 'src/i18n/i18n.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { UsersService } from 'src/users/users.service';
import { Telegraf } from 'telegraf';
import { InlineQueryResultArticle } from 'telegraf/types';

@Injectable()
export class ContactsAttachService {
  constructor(
    private prisma: PrismaService,
    @InjectBot()
    private bot: Telegraf,
    private i18nService: I18nService,
    private usersService: UsersService,
  ) {}

  async requestInvite(contact_id: number, user_id: number, userTGId: number) {
    const contact = await this.prisma.contact.findFirstOrThrow({
      where: {
        id: contact_id,
        user_id,
      },
      include: {
        Balance: {
          include: {
            currency: true,
          },
        },
      },
    });
    // @ts-expect-error undeclared method call
    const preparedMsg: { id: string } = await this.bot.telegram.callApi(
      // @ts-expect-error undeclared method call
      'savePreparedInlineMessage',
      {
        user_id: userTGId,
        result: {
          type: 'article',
          id: `accept-${contact_id}-${userTGId}`,
          title: `Пригласить`,
          input_message_content: {
            message_text: `Прошу продвердить привязку к контакту ${contact.name}. \n\n Баланс: ${contact.Balance.map((balance) => `${balance.amount} ${balance.currency.name}`).join('\n')}`,
          },
          reply_markup: {
            inline_keyboard: [
              [
                {
                  text: this.i18nService.getTranslation('actions.confirm'),
                  callback_data: `accept_contact_invite_${contact_id}-${user_id}`,
                },
                {
                  text: this.i18nService.getTranslation('actions.cancel'),
                  callback_data: `cancel`,
                },
              ],
            ],
          },
        } satisfies InlineQueryResultArticle,
        allow_user_chats: true,
      },
    );

    return preparedMsg.id;
  }

  async handleContactAttachAccept(
    invitedUserTGId: number,
    contactId: number,
    user_id: number,
  ) {
    // Find the original contact
    const originalContact = await this.prisma.contact.findFirst({
      where: {
        id: contactId,
        user_id: user_id,
      },
    });

    if (!originalContact) {
      throw new NotFoundException('Original contact not found');
    }

    const newUser = await this.usersService.getUserByTGId(invitedUserTGId);

    // Create or update the contact for the invited user with the ref_user_id
    const contact = await this.prisma.contact.update({
      where: {
        id: contactId,
      },
      data: {
        ref_user_id: newUser.id,
      },
    });

    return contact;
  }
}
