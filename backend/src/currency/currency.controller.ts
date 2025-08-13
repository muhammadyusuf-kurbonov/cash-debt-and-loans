import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
} from '@nestjs/common';
import { CurrencyService } from './currency.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiProperty,
} from '@nestjs/swagger';
import { RequestWithUser } from '../types/request';

class CreateCurrencyDto {
  @ApiProperty()
  name: string;
  @ApiProperty()
  symbol: string;
}

class UpdateCurrencyDto {
  name?: string;
  symbol?: string;
}

class CurrencyDto {
  id: number;
  user_id: number;
  name: string;
  symbol: string;
  createdAt: Date;
}

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
    type: CurrencyDto,
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
    type: [CurrencyDto],
  })
  findAll() {
    return this.currencyService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a specific currency' })
  @ApiResponse({
    status: 200,
    description: 'Currency details',
    type: CurrencyDto,
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
    type: CurrencyDto,
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
  @ApiResponse({ status: 200, description: 'Currency deleted successfully' })
  @ApiResponse({ status: 404, description: 'Currency not found' })
  remove(@Request() req: RequestWithUser, @Param('id') id: string) {
    return this.currencyService.remove(+id);
  }
}
