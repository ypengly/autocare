import { Router } from 'express';
import { prisma } from '../lib/prisma.js';
import { hashPassword, requireAuth, signToken, verifyPassword } from '../lib/auth.js';
import { asyncHandler, validate } from '../lib/validate.js';
import { loginSchema, registerSchema } from '../lib/schemas.js';
import { HttpError } from '../lib/errors.js';

export const authRouter = Router();

const publicUser = (u: { id: string; name: string; email: string }) => ({
  id: u.id,
  name: u.name,
  email: u.email,
});

authRouter.post(
  '/register',
  validate(registerSchema),
  asyncHandler(async (req, res) => {
    const { name, email, password } = req.body;
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) throw new HttpError(409, 'That email is already registered');

    const user = await prisma.user.create({
      data: { name, email, password: await hashPassword(password) },
    });
    res.status(201).json({ token: signToken(user.id), user: publicUser(user) });
  }),
);

authRouter.post(
  '/login',
  validate(loginSchema),
  asyncHandler(async (req, res) => {
    const { email, password } = req.body;
    const user = await prisma.user.findUnique({ where: { email } });
    // Same message either way so the endpoint cannot be used to discover emails.
    if (!user || !(await verifyPassword(password, user.password)))
      throw new HttpError(401, 'Email or password is incorrect');

    res.json({ token: signToken(user.id), user: publicUser(user) });
  }),
);

authRouter.get(
  '/me',
  requireAuth,
  asyncHandler(async (req, res) => {
    const user = await prisma.user.findUnique({ where: { id: req.userId! } });
    if (!user) throw new HttpError(401, 'Sign in to continue');
    res.json({ user: publicUser(user) });
  }),
);

// Password reset is stubbed: it always reports success so the endpoint
// cannot be used to check which emails exist.
authRouter.post('/forgot-password', (_req, res) => {
  res.json({ message: 'If that email is registered, a reset link is on its way.' });
});
