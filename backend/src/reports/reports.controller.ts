import { Controller, Get, Query, Request, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
  ApiResponse,
  ApiTags,
  IntersectionType,
  PickType,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RequestWithUser } from '../types/request';
import { Transaction } from '../types/prisma/transaction';
import { TransactionRelations } from '../types/prisma/transaction_relations';
import { SummaryDto, TrendItemDto } from './dto/report-response.dto';
import { ReportsService } from './reports.service';

@ApiTags('reports')
@Controller('reports')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get('summary')
  @ApiOperation({ summary: 'Get financial summary' })
  @ApiResponse({ status: 200, type: [SummaryDto] })
  @ApiQuery({ name: 'from', required: false })
  @ApiQuery({ name: 'to', required: false })
  @ApiQuery({ name: 'currencyId', required: false })
  getSummary(
    @Request() req: RequestWithUser,
    @Query('from') from?: string,
    @Query('to') to?: string,
    @Query('currencyId') currencyId?: string,
  ) {
    return this.reportsService.getSummary(
      req.user.id,
      from,
      to,
      currencyId ? +currencyId : undefined,
    );
  }

  @Get('transactions')
  @ApiOperation({ summary: 'Get transaction history for a period' })
  @ApiResponse({
    status: 200,
    type: [
      IntersectionType(
        Transaction,
        PickType(TransactionRelations, ['currency', 'contact'] as const),
      ),
    ],
  })
  @ApiQuery({ name: 'from', required: false })
  @ApiQuery({ name: 'to', required: false })
  @ApiQuery({ name: 'currencyId', required: false })
  getTransactions(
    @Request() req: RequestWithUser,
    @Query('from') from?: string,
    @Query('to') to?: string,
    @Query('currencyId') currencyId?: string,
  ) {
    return this.reportsService.getTransactions(
      req.user.id,
      from,
      to,
      currencyId ? +currencyId : undefined,
    );
  }

  @Get('trends')
  @ApiOperation({ summary: 'Get transaction trends over time' })
  @ApiResponse({ status: 200, type: [TrendItemDto] })
  @ApiQuery({
    name: 'period',
    required: false,
    enum: ['day', 'week', 'month', 'year'],
  })
  @ApiQuery({ name: 'from', required: false })
  @ApiQuery({ name: 'to', required: false })
  @ApiQuery({ name: 'currencyId', required: false })
  getTrends(
    @Request() req: RequestWithUser,
    @Query('period') period?: string,
    @Query('from') from?: string,
    @Query('to') to?: string,
    @Query('currencyId') currencyId?: string,
  ) {
    return this.reportsService.getTrends(
      req.user.id,
      period,
      from,
      to,
      currencyId ? +currencyId : undefined,
    );
  }
}
