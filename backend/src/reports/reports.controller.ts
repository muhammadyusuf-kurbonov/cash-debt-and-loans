import {
  Controller,
  Get,
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
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RequestWithUser } from '../types/request';
import {
  CurrencyBreakdownDto,
  DebtorCreditorDto,
  SummaryDto,
  TrendItemDto,
} from './dto/report-response.dto';
import { ReportsService } from './reports.service';

@ApiTags('reports')
@Controller('reports')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get('summary')
  @ApiOperation({ summary: 'Get financial summary' })
  @ApiResponse({ status: 200, type: SummaryDto })
  @ApiQuery({ name: 'from', required: false })
  @ApiQuery({ name: 'to', required: false })
  getSummary(
    @Request() req: RequestWithUser,
    @Query('from') from?: string,
    @Query('to') to?: string,
  ) {
    return this.reportsService.getSummary(req.user.id, from, to);
  }

  @Get('trends')
  @ApiOperation({ summary: 'Get transaction trends over time' })
  @ApiResponse({ status: 200, type: [TrendItemDto] })
  @ApiQuery({ name: 'period', required: false, enum: ['day', 'week', 'month', 'year'] })
  @ApiQuery({ name: 'from', required: false })
  @ApiQuery({ name: 'to', required: false })
  getTrends(
    @Request() req: RequestWithUser,
    @Query('period') period?: string,
    @Query('from') from?: string,
    @Query('to') to?: string,
  ) {
    return this.reportsService.getTrends(req.user.id, period, from, to);
  }

  @Get('top-debtors')
  @ApiOperation({ summary: 'Get contacts who owe you the most' })
  @ApiResponse({ status: 200, type: [DebtorCreditorDto] })
  @ApiQuery({ name: 'limit', required: false })
  getTopDebtors(
    @Request() req: RequestWithUser,
    @Query('limit') limit?: string,
  ) {
    return this.reportsService.getTopDebtors(
      req.user.id,
      limit ? +limit : undefined,
    );
  }

  @Get('top-creditors')
  @ApiOperation({ summary: 'Get contacts you owe the most' })
  @ApiResponse({ status: 200, type: [DebtorCreditorDto] })
  @ApiQuery({ name: 'limit', required: false })
  getTopCreditors(
    @Request() req: RequestWithUser,
    @Query('limit') limit?: string,
  ) {
    return this.reportsService.getTopCreditors(
      req.user.id,
      limit ? +limit : undefined,
    );
  }

  @Get('currency-breakdown')
  @ApiOperation({ summary: 'Get balance breakdown by currency' })
  @ApiResponse({ status: 200, type: [CurrencyBreakdownDto] })
  getCurrencyBreakdown(@Request() req: RequestWithUser) {
    return this.reportsService.getCurrencyBreakdown(req.user.id);
  }
}
