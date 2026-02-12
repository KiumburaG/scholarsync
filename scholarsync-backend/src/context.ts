import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';

export interface Context {
  req: Request;
  res: Response;
  userId?: string;
}

export interface JWTPayload {
  userId: string;
  email: string;
}

export async function createContext({ req, res }: { req: Request; res: Response }): Promise<Context> {
  const context: Context = { req, res };

  // Extract token from Authorization header
  const authHeader = req.headers.authorization;

  if (authHeader) {
    const token = authHeader.replace('Bearer ', '');

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JWTPayload;
      context.userId = decoded.userId;
    } catch (error) {
      // Invalid token - context.userId remains undefined
      console.warn('Invalid JWT token:', error);
    }
  }

  return context;
}
