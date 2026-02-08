import { z } from 'zod'

export const monthSchema = z.object({
  year: z
    .number()
    .int('Az évnek egész számnak kell lennie')
    .min(2000, 'Az év nem lehet kisebb, mint 2000')
    .max(2100, 'Az év nem lehet nagyobb, mint 2100'),
  month: z
    .number()
    .int('A hónapnak egész számnak kell lennie')
    .min(1, 'A hónap értéke 1 és 12 között kell legyen')
    .max(12, 'A hónap értéke 1 és 12 között kell legyen'),
  starting_balance: z
    .number()
    .default(0)
    .refine((val) => !isNaN(val), 'A kezdő egyenlegnek számnak kell lennie'),
})

// For URL parameter parsing
export const monthParamSchema = z
  .string()
  .regex(/^\d{4}-\d{2}$/, 'Érvénytelen hónap formátum (használd: YYYY-MM)')
  .transform((val) => {
    const [year, month] = val.split('-').map(Number)
    return { year, month }
  })

export type MonthInput = z.infer<typeof monthSchema>
export type MonthParam = z.infer<typeof monthParamSchema>
