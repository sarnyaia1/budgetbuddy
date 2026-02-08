import { z } from 'zod'

const incomeSourceTypes = ['Fizetés', 'Utalás', 'Vállalkozás', 'Egyéb'] as const

export const incomeSchema = z
  .object({
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
    source_type: z.enum(incomeSourceTypes, {
      errorMap: () => ({ message: 'Érvénytelen bevételi forrás típus' }),
    }),
    custom_source: z.string().max(200, 'A forrás neve túl hosszú').nullable().optional(),
    notes: z.string().max(500, 'A megjegyzés túl hosszú').nullable().optional(),
  })
  .refine(
    (data) => {
      // If source_type is "Egyéb", custom_source is required
      if (data.source_type === 'Egyéb') {
        return !!data.custom_source && data.custom_source.trim().length > 0
      }
      return true
    },
    {
      message: 'Az "Egyéb" forrás esetén a forrás nevének megadása kötelező',
      path: ['custom_source'],
    }
  )

export const createIncomeSchema = incomeSchema.extend({
  month_id: z.string().uuid('Érvénytelen hónap azonosító'),
})

// Update schema - manually make fields optional (can't use .partial() with .refine())
export const updateIncomeSchema = z
  .object({
    id: z.string().uuid('Érvénytelen bevétel azonosító'),
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
    source_type: z.enum(incomeSourceTypes, {
      errorMap: () => ({ message: 'Érvénytelen bevételi forrás típus' }),
    }).optional(),
    custom_source: z.string().max(200, 'A forrás neve túl hosszú').nullable().optional(),
    notes: z.string().max(500, 'A megjegyzés túl hosszú').nullable().optional(),
  })
  .refine(
    (data) => {
      // If source_type is "Egyéb", custom_source is required
      if (data.source_type === 'Egyéb') {
        return !!data.custom_source && data.custom_source.trim().length > 0
      }
      return true
    },
    {
      message: 'Az "Egyéb" forrás esetén a forrás nevének megadása kötelező',
      path: ['custom_source'],
    }
  )

export type IncomeInput = z.infer<typeof incomeSchema>
export type CreateIncomeInput = z.infer<typeof createIncomeSchema>
export type UpdateIncomeInput = z.infer<typeof updateIncomeSchema>

// Export source types for use in select components
export const INCOME_SOURCE_TYPES = incomeSourceTypes
