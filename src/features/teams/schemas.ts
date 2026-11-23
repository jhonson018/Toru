import { z } from 'zod';

export const teamNameSchema = z
  .string()
  .trim()
  .min(2, 'El nombre del equipo es muy corto.')
  .max(60, 'El nombre admite 60 caracteres.');
