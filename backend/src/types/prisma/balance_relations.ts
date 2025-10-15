import { Currency } from './currency';
import { Contact } from './contact';
import { ApiProperty } from '@nestjs/swagger';

export class BalanceRelations {
  @ApiProperty({ type: () => Currency })
  currency: Currency;

  @ApiProperty({ type: () => Contact })
  contact: Contact;
}
