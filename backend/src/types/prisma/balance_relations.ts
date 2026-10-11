import { Currency, type Currency as CurrencyAsType } from './currency';
import { Contact, type Contact as ContactAsType } from './contact';
import { ApiProperty } from '@nestjs/swagger';

export class BalanceRelations {
  @ApiProperty({ type: () => Currency })
  currency: CurrencyAsType;

  @ApiProperty({ type: () => Contact })
  contact: ContactAsType;
}
