import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RequestWithUser } from '../types/request';
import { CurrencyService } from './currency.service';
import { CreateCurrencyDto } from './dto/create-currency.dto';
import { CurrencyResponseDto } from './dto/currency-response.dto';
import { UpdateCurrencyDto } from './dto/update-currency.dto';

@ApiTags('currencies')
@Controller('currencies')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class CurrencyController {
  constructor(private readonly currencyService: CurrencyService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new currency' })
  @ApiResponse({
    status: 201,
    description: 'Currency created successfully',
    type: CurrencyResponseDto,
  })
  create(@Body() createCurrencyDto: CreateCurrencyDto) {
    return this.currencyService.create(
      createCurrencyDto.name,
      createCurrencyDto.symbol,
    );
  }

  @Get()
  @ApiOperation({ summary: 'Get all currencies for current user' })
  @ApiResponse({
    status: 200,
    description: 'List of currencies',
    type: [CurrencyResponseDto],
  })
  findAll() {
    return this.currencyService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a specific currency' })
  @ApiResponse({
    status: 200,
    description: 'Currency details',
    type: CurrencyResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Currency not found' })
  findOne(@Request() req: RequestWithUser, @Param('id') id: string) {
    return this.currencyService.findOne(+id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a currency' })
  @ApiResponse({
    status: 200,
    description: 'Currency updated successfully',
    type: CurrencyResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Currency not found' })
  update(
    @Request() req: RequestWithUser,
    @Param('id') id: string,
    @Body() updateCurrencyDto: UpdateCurrencyDto,
  ) {
    return this.currencyService.update(
      +id,
      updateCurrencyDto.name,
      updateCurrencyDto.symbol,
    );
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a currency' })
  @ApiResponse({
    status: 200,
    description: 'Currency deleted successfully',
    type: CurrencyResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Currency not found' })
  remove(@Request() req: RequestWithUser, @Param('id') id: string) {
    return this.currencyService.remove(+id);
  }
}
