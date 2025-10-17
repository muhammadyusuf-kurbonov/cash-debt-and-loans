export class AuthResponseDto {
  token: string;
  user: {
    id: number;
    email?: string;
    telegram_id?: string;
    name?: string;
  };
}
