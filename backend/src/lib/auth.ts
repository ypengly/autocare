import type { NextFunction, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { HttpError } from './errors.js';

const SECRET = process.env.JWT_SECRET ?? 'dev-secret-change-me';
const EXPIRES_IN = process.env.JWT_EXPIRES_IN ?? '7d';

export const hashPassword = (plain: string) => bcrypt.hash(plain, 12);
export const verifyPassword = (plain: string, hash: string) => bcrypt.compare(plain, hash);

export const signToken = (userId: string) =>
  jwt.sign({ sub: userId }, SECRET, { expiresIn: EXPIRES_IN } as jwt.SignOptions);

declare global {
  namespace Express {
    interface Request {
      userId?: string;
    }
  }
}

/** Rejects any request without a valid bearer token. */
export function requireAuth(req: Request, _res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) return next(new HttpError(401, 'Sign in to continue'));
  try {
    const payload = jwt.verify(header.slice(7), SECRET) as jwt.JwtPayload;
    req.userId = String(payload.sub);
    next();
  } catch {
    next(new HttpError(401, 'Your session has expired. Sign in again.'));
  }
}
