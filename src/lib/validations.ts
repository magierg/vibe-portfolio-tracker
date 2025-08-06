import { z } from 'zod';

// Investment validation schema
export const investmentSchema = z.object({
  name: z.string().min(1, 'Investment name is required').max(100, 'Name too long'),
  type: z.enum(['managed-fund', 'etf', 'property'], {
    required_error: 'Investment type is required',
  }),
  provider: z.string().min(1, 'Provider is required'),
  units: z.number().positive('Units must be positive').optional(),
  unitPrice: z.number().positive('Unit price must be positive').optional(),
  totalValue: z.number().positive('Total value must be positive'),
  purchaseDate: z.date({
    required_error: 'Purchase date is required',
  }),
});

// User profile validation schema
export const userProfileSchema = z.object({
  displayName: z.string().min(1, 'Display name is required').max(50, 'Name too long'),
  email: z.string().email('Invalid email address'),
});

// Auth validation schemas
export const signInSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export const signUpSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string().min(6, 'Confirm password is required'),
  displayName: z.string().min(1, 'Display name is required').max(50, 'Name too long'),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

// Type inference from schemas
export type InvestmentFormData = z.infer<typeof investmentSchema>;
export type UserProfileFormData = z.infer<typeof userProfileSchema>;
export type SignInFormData = z.infer<typeof signInSchema>;
export type SignUpFormData = z.infer<typeof signUpSchema>;
