import { Contact, type Contact as ContactAsType } from './contact';
import { Currency, type Currency as CurrencyAsType } from './currency';
import { User, type User as UserAsType } from './user';
import { ApiPropertyOptional, ApiProperty } from '@nestjs/swagger';

export class TransactionRelations {
  @ApiPropertyOptional({ type: () => Contact })
  contact: ContactAsType | null;

  @ApiProperty({ type: () => Currency })
  currency: CurrencyAsType;

  @ApiProperty({ type: () => User })
  user: UserAsType;
}
