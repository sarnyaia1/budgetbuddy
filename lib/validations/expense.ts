import { z } from 'zod'

const expenseCategories = [
  'Bevásárlás',
  'Szórakozás',
  'Vendéglátás',
  'Extra',
  'Utazás',
  'Kötelező kiadás',
  'Ruha',
  'Sport',
] as const

export const expenseSchema = z.object({
  date: z
    .string()
    .min(1, 'A dátum kötelező')
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Érvénytelen dátum formátum (használd: YYYY-MM-DD)')
    .refine((val) => {
      const date = new Date(val)
      return !isNaN(date.getTime())
    }, 'Érvénytelen dátum'),
  amount: z
    .number({ invalid_type_error: 'Az összegnek számnak kell lennie' })
    .positive('Az összegnek pozitív számnak kell lennie')
    .max(99999999.99, 'Az összeg túl nagy'),
  item_name: z
    .string()
    .min(1, 'A tétel neve kötelező')
    .max(200, 'A tétel neve túl hosszú'),
  category: z.enum(expenseCategories, {
    errorMap: () => ({ message: 'Érvénytelen kategória' }),
  }),
  notes: z.string().max(500, 'A megjegyzés túl hosszú').nullable().optional(),
})

export const createExpenseSchema = expenseSchema.extend({
  month_id: z.string().uuid('Érvénytelen hónap azonosító'),
})

// Update schema - manually make fields optional (can't use .partial() with .refine())
export const updateExpenseSchema = z.object({
  id: z.string().uuid('Érvénytelen kiadás azonosító'),
  date: z
    .string()
    .min(1, 'A dátum kötelező')
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Érvénytelen dátum formátum (használd: YYYY-MM-DD)')
    .refine((val) => {
      const date = new Date(val)
      return !isNaN(date.getTime())
    }, 'Érvénytelen dátum')
    .optional(),
  amount: z
    .number({ invalid_type_error: 'Az összegnek számnak kell lennie' })
    .positive('Az összegnek pozitív számnak kell lennie')
    .max(99999999.99, 'Az összeg túl nagy')
    .optional(),
  item_name: z
    .string()
    .min(1, 'A tétel neve kötelező')
    .max(200, 'A tétel neve túl hosszú')
    .optional(),
  category: z.enum(expenseCategories, {
    errorMap: () => ({ message: 'Érvénytelen kategória' }),
  }).optional(),
  notes: z.string().max(500, 'A megjegyzés túl hosszú').nullable().optional(),
})

export type ExpenseInput = z.infer<typeof expenseSchema>
export type CreateExpenseInput = z.infer<typeof createExpenseSchema>
export type UpdateExpenseInput = z.infer<typeof updateExpenseSchema>

// Export categories for use in select components
export const EXPENSE_CATEGORIES = expenseCategories
