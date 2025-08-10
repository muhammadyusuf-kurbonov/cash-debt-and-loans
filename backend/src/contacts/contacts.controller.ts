import {
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
  ApiProperty,
  ApiPropertyOptional,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { RequestWithUser } from 'src/types/request';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ContactsService } from './contacts.service';

class CreateContactDto {
  @ApiProperty()
  name: string;

  @ApiPropertyOptional()
  ref_user_id?: number;
}

class UpdateContactDto {
  name?: string;
  ref_user_id?: number;
}

class ContactDto {
  id: number;
  user_id: number;
  name?: string;
  ref_user_id?: number;
  ref_user?: {
    id: number;
    name?: string;
    email?: string;
    telegram_id?: string;
  };
  Balance: Array<{
    currency_id: number;
    amount: number;
    currency: {
      id: number;
      name: string;
      symbol: string;
    };
  }>;
}

@ApiTags('contacts')
@Controller('contacts')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ContactsController {
  constructor(private readonly contactsService: ContactsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new contact' })
  @ApiResponse({
    status: 201,
    description: 'Contact created successfully',
    type: ContactDto,
  })
  async create(
    @Request() req: RequestWithUser,
    @Body() createContactDto: CreateContactDto,
  ) {
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
    type: [ContactDto],
  })
  findAll(@Request() req: RequestWithUser) {
    return this.contactsService.findAll(req.user.id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a specific contact' })
  @ApiResponse({
    status: 200,
    description: 'Contact details with balances',
    type: ContactDto,
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
    type: ContactDto,
  })
  @ApiResponse({ status: 404, description: 'Contact not found' })
  update(
    @Request() req: RequestWithUser,
    @Param('id') id: string,
    @Body() updateContactDto: UpdateContactDto,
  ) {
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
    type: [ContactDto],
  })
  @ApiResponse({ status: 404, description: 'Contact not found' })
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
}
