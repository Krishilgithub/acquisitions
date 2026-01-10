import { z } from 'zod';

export const signUpSchema = z.object({
  name: z
    .string()
    .min(3, 'Name must be at least 3 characters long')
    .max(100, 'Name must be at most 100 characters long')
    .trim(),
  email: z.string().email('Invalid email address').toLowerCase().trim(),
  password: z
    .string()
    .min(6, 'Password must be at least 6 characters long')
    .max(128, 'Password must be at most 128 characters long'),
  role: z
    .enum(['user', 'admin'], {
      required_error: 'Role is required',
      invalid_type_error: 'Role must be a string',
    })
    .default('user'),
});

export const signInSchema = z.object({
  email: z.string().email('Invalid email address').toLowerCase().trim(),
  password: z
    .string()
    .min(6, 'Password must be at least 6 characters long')
    .max(128, 'Password must be at most 128 characters long'),
});
