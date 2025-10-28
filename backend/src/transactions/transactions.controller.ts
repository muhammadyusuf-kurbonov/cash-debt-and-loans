import {
  Body,
  Controller,
  NotFoundException,
  Param,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PrismaService } from '../prisma/prisma.service';
import { RequestWithUser } from '../types/request';
import { CreateTransactionDto } from './dto/create-transaction-dto';
import { TransactionsService } from './transactions.service';
import { TransactionResponseDto } from './dto/transaction-response-dto';

@ApiTags('transactions')
@Controller('transactions')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class TransactionsController {
  constructor(
    private readonly transactionsService: TransactionsService,
    private readonly prisma: PrismaService,
  ) {}

  @Post('topup')
  @ApiOperation({ summary: 'Top up balance for a contact' })
  @ApiResponse({
    status: 201,
    description: 'Balance topped up successfully',
    type: TransactionResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Contact or currency not found' })
  @ApiBody({ type: CreateTransactionDto })
  async topup(
    @Request() req: RequestWithUser,
    @Body() dto: CreateTransactionDto,
  ) {
    // Verify that contact belongs to user
    const contact = await this.prisma.contact.findFirst({
      where: {
        id: dto.contact_id,
        user_id: req.user.id,
      },
    });

    if (!contact) {
      throw new NotFoundException('Contact not found');
    }

    return this.transactionsService.create(
      dto.contact_id ?? null,
      dto.currency_id,
      Math.abs(dto.amount), // Ensure amount is positive
      null,
      null,
      req.user.id,
    );
  }

  @Post('withdraw')
  @ApiOperation({ summary: 'Withdraw balance from a contact' })
  @ApiResponse({
    status: 201,
    description: 'Balance withdrawn successfully',
    type: TransactionResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Contact or currency not found' })
  @ApiBody({ type: CreateTransactionDto })
  async withdraw(
    @Request() req: RequestWithUser,
    @Body() dto: CreateTransactionDto,
  ) {
    // Verify that contact belongs to user
    const contact = await this.prisma.contact.findFirst({
      where: {
        id: dto.contact_id,
        user_id: req.user.id,
      },
    });

    if (!contact) {
      throw new NotFoundException('Contact not found');
    }

    return this.transactionsService.create(
      dto.contact_id ?? null,
      dto.currency_id,
      -Math.abs(dto.amount), // Make amount negative
      null,
      null,
      req.user.id,
    );
  }

  @Post(':id/cancel')
  @ApiOperation({ summary: 'Cancel a transaction' })
  @ApiResponse({
    status: 200,
    description: 'Transaction cancelled successfully',
    type: TransactionResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Transaction not found' })
  cancel(@Request() req: RequestWithUser, @Param('id') id: string) {
    return this.transactionsService.remove(+id, req.user.id);
  }
}
