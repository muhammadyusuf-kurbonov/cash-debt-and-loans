declare namespace Express {
  export interface User {
    id: number;
    email?: string | null;
    name?: string | null;
    telegram_id?: string | null;
    is_verified: boolean;
  }
}
