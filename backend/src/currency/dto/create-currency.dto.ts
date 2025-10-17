import { PickType } from '@nestjs/swagger';
import { Currency } from 'src/types/prisma/currency';

export class CreateCurrencyDto extends PickType(Currency, ['name', 'symbol']) {}
