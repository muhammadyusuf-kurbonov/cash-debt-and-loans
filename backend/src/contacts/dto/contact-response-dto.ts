import { ApiProperty, IntersectionType, PickType } from '@nestjs/swagger';
import { Balance } from 'src/types/prisma/balance';
import { BalanceRelations } from 'src/types/prisma/balance_relations';
import { Contact } from 'src/types/prisma/contact';

// Use inheritance to get all properties from BaseContactDto
export class ContactResponseDto extends Contact {
  @ApiProperty({
    type: () => [
      IntersectionType(Balance, PickType(BalanceRelations, ['currency'])),
    ],
  }) // **This is how you define an array of complex/nested DTOs**
  Balance: Array<Balance & Pick<BalanceRelations, 'currency'>>;
}
