import { z } from 'zod';

const emailField = z.string().trim().email('Escribe un correo válido.');

// Supabase, por defecto, no acepta contraseñas de menos de 6 caracteres.
const passwordField = z.string().min(6, 'La contraseña necesita al menos 6 caracteres.');

export const callsignSchema = z
  .string()
  .trim()
  .min(2, 'El indicativo es muy corto.')
  .max(40, 'El indicativo admite 40 caracteres.');

export const loginSchema = z.object({
  identifier: z.string().trim().min(2, 'Escribe tu indicativo o tu correo.'),
  password: passwordField,
});

export const signupSchema = z.object({
  callsign: callsignSchema,
  fullName: z.string().trim().max(80, 'El nombre admite 80 caracteres.'),
  email: emailField,
  password: passwordField,
});

export const resetSchema = z.object({
  email: emailField,
});

export const newPasswordSchema = z.object({
  password: passwordField,
});

export type LoginValues = z.infer<typeof loginSchema>;
export type SignupValues = z.infer<typeof signupSchema>;
