import { ApiProperty, getSchemaPath } from '@nestjs/swagger';
import { ContactBalance } from 'src/contacts/contacts.service';
import { Contact } from 'src/types/prisma/contact';
import { Currency } from 'src/types/prisma/currency';

/**
 * A contact with its computed balances attached. `Balance` is no longer a
 * Prisma relation, so the shape is declared inline here instead of composed
 * from `Balance` + `BalanceRelations`. Field names and the property name are
 * unchanged from the previous contract.
 */
export class ContactResponseDto extends Contact {
  @ApiProperty({
    type: 'array',
    items: {
      type: 'object',
      properties: {
        currency_id: { type: 'integer' },
        contact_id: { type: 'integer' },
        amount: { type: 'number' },
        updatedAt: { type: 'string', format: 'date-time' },
        currency: { $ref: getSchemaPath(Currency) },
      },
    },
  })
  Balance: ContactBalance[];
}