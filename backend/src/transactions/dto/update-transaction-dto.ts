import { PickType } from '@nestjs/swagger';
import { Transaction } from 'src/types/prisma/transaction';

export class UpdateTransactionDto extends PickType(Transaction, ['note']) {}
