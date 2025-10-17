import { PickType } from '@nestjs/swagger';
import { Transaction } from 'src/types/prisma/transaction';

export class CreateTransactionDto extends PickType(Transaction, [
  'contact_id',
  'currency_id',
  'amount',
  'note',
]) {}
