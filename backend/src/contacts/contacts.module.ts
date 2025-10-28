import { Module } from '@nestjs/common';
import { TransactionsModule } from 'src/transactions/transactions.module';
import { PrismaModule } from '../prisma/prisma.module';
import { ContactsAttachService } from './contact-attach.service';
import { ContactsController } from './contacts.controller';
import { ContactsService } from './contacts.service';
import { I18nService } from 'src/i18n/i18n.service';
import { UsersModule } from 'src/users/users.module';

@Module({
  imports: [PrismaModule, TransactionsModule, UsersModule],
  controllers: [ContactsController],
  providers: [ContactsService, ContactsAttachService, I18nService],
  exports: [ContactsService, ContactsAttachService],
})
export class ContactsModule {}
