import { Contact } from './contact';
import { Transaction } from './transaction';
import { ApiProperty } from '@nestjs/swagger';

export class UserRelations {
  @ApiProperty({ isArray: true, type: () => Contact })
  contacts: Contact[];

  @ApiProperty({ isArray: true, type: () => Transaction })
  transactions: Transaction[];

  @ApiProperty({ isArray: true, type: () => Contact })
  isContactFor: Contact[];
}
