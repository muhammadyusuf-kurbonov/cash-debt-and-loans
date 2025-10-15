import { Contact } from './contact';
import { Currency } from './currency';
import { ApiProperty } from '@nestjs/swagger';

export class TransactionRelations {
  @ApiProperty({ type: () => Contact })
  contact: Contact;

  @ApiProperty({ type: () => Currency })
  currency: Currency;
}
