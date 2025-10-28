import { Contact } from './contact';
import { Currency } from './currency';
import { User } from './user';
import { ApiPropertyOptional, ApiProperty } from '@nestjs/swagger';

export class TransactionRelations {
  @ApiPropertyOptional({ type: () => Contact })
  contact?: Contact;

  @ApiProperty({ type: () => Currency })
  currency: Currency;

  @ApiPropertyOptional({ type: () => User })
  user?: User;
}
