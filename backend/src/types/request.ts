import { Request } from 'express';

export type RequestWithUser = Request & {
  user: {
    id: number;
    email?: string | null;
    name?: string | null;
    telegram_id?: string | null;
    is_verified: boolean;
  };
};
