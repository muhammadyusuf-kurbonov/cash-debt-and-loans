import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
  ApiResponse,
  ApiTags,
  IntersectionType,
  PickType,
} from '@nestjs/swagger';
import { TransactionsService } from 'src/transactions/transactions.service';
import { Balance } from 'src/types/prisma/balance';
import { BalanceRelations } from 'src/types/prisma/balance_relations';
import { Contact } from 'src/types/prisma/contact';
import { Transaction } from 'src/types/prisma/transaction';
import { TransactionRelations } from 'src/types/prisma/transaction_relations';
import { RequestWithUser } from 'src/types/request';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ContactsService } from './contacts.service';
import { ContactResponseDto } from './dto/contact-response-dto';
import { ContactsAttachService } from './contact-attach.service';

class CreateContactDto extends PickType(Contact, ['name', 'ref_user_id']) {}

class UpdateContactDto extends PickType(Contact, ['name', 'ref_user_id']) {}

@ApiTags('contacts')
@Controller('contacts')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ContactsController {
  constructor(
    private readonly contactsService: ContactsService,
    private readonly contactsAttachService: ContactsAttachService,
    private readonly transactionsService: TransactionsService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Create a new contact' })
  @ApiResponse({
    status: 201,
    description: 'Contact created successfully',
    type: Contact,
  })
  async create(
    @Request() req: RequestWithUser,
    @Body() createContactDto: CreateContactDto,
  ) {
    if (!createContactDto.name) {
      throw new BadRequestException();
    }

    return await this.contactsService.create(
      req.user.id,
      createContactDto.name,
      createContactDto.ref_user_id,
    );
  }

  @Get()
  @ApiOperation({ summary: 'Get all contacts for current user' })
  @ApiResponse({
    status: 200,
    description: 'List of contacts with their balances',
    type: [ContactResponseDto],
  })
  findAll(@Request() req: RequestWithUser) {
    return this.contactsService.findAll(req.user.id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a specific contact' })
  @ApiResponse({
    status: 200,
    description: 'Contact details with balances',
    type: ContactResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Contact not found' })
  findOne(@Request() req: RequestWithUser, @Param('id') id: string) {
    return this.contactsService.findOne(+id, req.user.id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a contact' })
  @ApiResponse({
    status: 200,
    description: 'Contact updated successfully',
    type: Contact,
  })
  @ApiResponse({ status: 404, description: 'Contact not found' })
  update(
    @Request() req: RequestWithUser,
    @Param('id') id: string,
    @Body() updateContactDto: UpdateContactDto,
  ) {
    if (!updateContactDto.name) {
      throw new BadRequestException();
    }

    return this.contactsService.update(
      +id,
      req.user.id,
      updateContactDto.name,
      updateContactDto.ref_user_id,
    );
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a contact' })
  @ApiResponse({ status: 200, description: 'Contact deleted successfully' })
  @ApiResponse({ status: 404, description: 'Contact not found' })
  remove(@Request() req: RequestWithUser, @Param('id') id: string) {
    return this.contactsService.remove(+id, req.user.id);
  }

  @Get(':id/balance')
  @ApiOperation({ summary: 'Get balances for a specific contact' })
  @ApiResponse({
    status: 200,
    description: 'Contact balances per currency',
    type: [IntersectionType(Balance, PickType(BalanceRelations, ['currency']))],
  })
  @ApiResponse({ status: 404, description: 'Contact not found' })
  @ApiQuery({
    name: 'currencyId',
    required: false,
    description: 'Optional currency ID to filter balances',
  })
  async getBalance(
    @Request() req: RequestWithUser,
    @Param('id') contactId: string,
    @Query('currencyId') currencyId?: string,
  ) {
    const balances = await this.contactsService.getBalance(
      +contactId,
      req.user.id,
      currencyId ? +currencyId : undefined,
    );
    return balances;
  }

  @Get(':id/prepare-invite')
  @ApiOperation({
    summary: 'Prepare an invite message with inline button for Telegram',
  })
  @ApiResponse({
    status: 200,
    description: 'Invite message and inline keyboard prepared',
    type: String,
  })
  @ApiResponse({ status: 404, description: 'Contact not found' })
  async prepareInvite(
    @Request() req: RequestWithUser,
    @Param('id') contactId: string,
  ) {
    // Get bot username from environment
    if (!req.user.telegram_id) {
      throw new BadRequestException();
    }

    return await this.contactsAttachService.requestInvite(
      +contactId,
      req.user.id,
      +req.user.telegram_id,
    );
  }

  @Get(':id/transactions')
  @ApiOperation({ summary: 'Get transactions for a specific contact' })
  @ApiResponse({ status: 404, description: 'Contact not found' })
  @ApiResponse({
    status: 200,
    type: [
      IntersectionType(
        Transaction,
        PickType(TransactionRelations, ['currency'] as const),
      ),
    ],
  })
  @ApiQuery({
    name: 'currencyId',
    required: false,
    description: 'Optional currency ID to filter balances',
  })
  async getTransactions(
    @Request() req: RequestWithUser,
    @Param('id') contactId: string,
    @Query('currencyId') currencyId?: string,
  ): Promise<Array<Transaction & Pick<TransactionRelations, 'currency'>>> {
    const transactions =
      await this.transactionsService.getAllTransactionsOfContact(
        +contactId,
        currencyId ? +currencyId : undefined,
      );
    return transactions.map((transaction) => ({
      ...transaction,
      note: transaction.note,
      draftId: transaction.draftId,
      contact_id: transaction.contact_id,
      deletedAt: transaction.deletedAt,
    }));
  }
}
