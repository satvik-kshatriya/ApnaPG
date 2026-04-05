import { Types } from 'mongoose';

declare global {
  namespace Express {
    interface Request {
      user?: {
        clerk_id: string;
        role: string;
        _id?: Types.ObjectId;
      };
    }
  }
}
