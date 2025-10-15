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
import { Transaction as TransactionDto } from 'src/types/prisma/transaction';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PrismaService } from '../prisma/prisma.service';
import { RequestWithUser } from '../types/request';
import { TransactionsService } from './transactions.service';

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
  @ApiResponse({ status: 201, description: 'Balance topped up successfully' })
  @ApiResponse({ status: 404, description: 'Contact or currency not found' })
  @ApiBody({ type: TransactionDto })
  async topup(@Request() req: RequestWithUser, @Body() dto: TransactionDto) {
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
      dto.contact_id,
      dto.currency_id,
      Math.abs(dto.amount), // Ensure amount is positive
    );
  }

  @Post('withdraw')
  @ApiOperation({ summary: 'Withdraw balance from a contact' })
  @ApiResponse({ status: 201, description: 'Balance withdrawn successfully' })
  @ApiResponse({ status: 404, description: 'Contact or currency not found' })
  @ApiBody({ type: TransactionDto })
  async withdraw(@Request() req: RequestWithUser, @Body() dto: TransactionDto) {
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
      dto.contact_id,
      dto.currency_id,
      -Math.abs(dto.amount), // Make amount negative
    );
  }

  @Post(':id/cancel')
  @ApiOperation({ summary: 'Cancel a transaction' })
  @ApiResponse({
    status: 200,
    description: 'Transaction cancelled successfully',
  })
  @ApiResponse({ status: 404, description: 'Transaction not found' })
  cancel(@Request() req: RequestWithUser, @Param('id') id: string) {
    return this.transactionsService.remove(+id, req.user.id);
  }
}
