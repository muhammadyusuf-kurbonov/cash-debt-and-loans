import { Contact } from './contact';
import { ApiProperty } from '@nestjs/swagger';

export class UserRelations {
  @ApiProperty({ isArray: true, type: () => Contact })
  contacts: Contact[];

  @ApiProperty({ isArray: true, type: () => Contact })
  isContactFor: Contact[];
}
