'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { format } from 'date-fns'
import { Loader2 } from 'lucide-react'
import { expenseSchema, type ExpenseInput, EXPENSE_CATEGORIES } from '@/lib/validations/expense'
import { createExpense, updateExpense } from '@/app/actions/expenses'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { Expense } from '@/lib/types/database'
import { toast } from 'sonner'

const categoryPlaceholders: Record<string, string> = {
  'Bevásárlás': 'pl. Lidl, Spar, Tesco',
  'Szórakozás': 'pl. Mozi, Koncert, Netflix',
  'Vendéglátás': 'pl. Pizzéria, Kávézó',
  'Extra': 'pl. Ajándék, Különleges kiadás',
  'Utazás': 'pl. Vonatjegy, Benzin',
  'Kötelező kiadás': 'pl. Rezsi, Biztosítás',
  'Ruha': 'pl. Cipő, Kabát',
  'Sport': 'pl. Edzőterem, Úszójegy',
}

interface ExpenseFormProps {
  monthId: string
  expense?: Expense
  onSuccess?: () => void
}

export function ExpenseForm({ monthId, expense, onSuccess }: ExpenseFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const today = format(new Date(), 'yyyy-MM-dd')

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm<ExpenseInput>({
    resolver: zodResolver(expenseSchema),
    mode: 'onBlur',
    defaultValues: expense
      ? {
          date: expense.date,
          amount: Number(expense.amount),
          item_name: expense.item_name,
          category: expense.category,
          notes: expense.notes || '',
        }
      : {
          date: today,
          amount: undefined as any,
          item_name: '',
          category: 'Bevásárlás',
          notes: '',
        },
  })

  const category = watch('category')

  const onSubmit = async (data: ExpenseInput) => {
    setIsLoading(true)

    try {
      const result = expense
        ? await updateExpense({ ...data, id: expense.id })
        : await createExpense({ ...data, month_id: monthId })

      if (result.error) {
        toast.error('Hiba történt', {
          description: result.error,
        })
      } else {
        toast.success(expense ? 'Kiadás frissítve' : 'Kiadás hozzáadva', {
          description: expense
            ? 'A kiadás sikeresen frissítve.'
            : 'Az új kiadás sikeresen hozzáadva.',
        })

        if (onSuccess) {
          onSuccess()
        } else {
          router.refresh()
        }
      }
    } catch (error) {
      toast.error('Hiba történt', {
        description: 'Váratlan hiba történt. Próbáld újra.',
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="date">Dátum</Label>
        <Input
          id="date"
          type="date"
          max={today}
          {...register('date')}
          className={errors.date ? 'border-red-500' : ''}
          disabled={isLoading}
        />
        {errors.date && (
          <p className="text-sm text-red-500">{errors.date.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="item_name">Tétel neve</Label>
        <Input
          id="item_name"
          type="text"
          placeholder={categoryPlaceholders[category] || 'pl. Élelmiszerbolt'}
          {...register('item_name')}
          className={errors.item_name ? 'border-red-500' : ''}
          disabled={isLoading}
        />
        {errors.item_name && (
          <p className="text-sm text-red-500">{errors.item_name.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="amount">Összeg (Ft)</Label>
        <Input
          id="amount"
          type="number"
          step="0.01"
          placeholder="pl. 5000"
          {...register('amount', { valueAsNumber: true })}
          className={errors.amount ? 'border-red-500' : ''}
          disabled={isLoading}
        />
        {errors.amount && (
          <p className="text-sm text-red-500">{errors.amount.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="category">Kategória</Label>
        <Select
          value={category}
          onValueChange={(value) =>
            setValue('category', value as (typeof EXPENSE_CATEGORIES)[number])
          }
          disabled={isLoading}
        >
          <SelectTrigger className={errors.category ? 'border-red-500' : ''}>
            <SelectValue placeholder="Válassz kategóriát" />
          </SelectTrigger>
          <SelectContent>
            {EXPENSE_CATEGORIES.map((cat) => (
              <SelectItem key={cat} value={cat}>
                {cat}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.category && (
          <p className="text-sm text-red-500">{errors.category.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">Megjegyzés (opcionális)</Label>
        <Input
          id="notes"
          type="text"
          placeholder="További részletek..."
          {...register('notes')}
          className={errors.notes ? 'border-red-500' : ''}
          disabled={isLoading}
        />
        {errors.notes && (
          <p className="text-sm text-red-500">{errors.notes.message}</p>
        )}
      </div>

      <div className="flex gap-2 pt-4">
        <Button type="submit" className="flex-1" disabled={isLoading}>
          {isLoading && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
          {expense ? 'Frissítés' : 'Hozzáadás'}
        </Button>
      </div>
    </form>
  )
}
