import { User } from './user';
import { Transaction } from './transaction';
import { Balance } from './balance';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ContactRelations {
  @ApiProperty({ type: () => User })
  user: User;

  @ApiPropertyOptional({ type: () => User })
  ref_user: User | null;

  @ApiProperty({ isArray: true, type: () => Transaction })
  Transaction: Transaction[];

  @ApiProperty({ isArray: true, type: () => Balance })
  Balance: Balance[];
}
