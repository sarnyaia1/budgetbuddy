'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { format } from 'date-fns'
import { Loader2 } from 'lucide-react'
import { incomeSchema, type IncomeInput, INCOME_SOURCE_TYPES } from '@/lib/validations/income'
import { createIncome, updateIncome } from '@/app/actions/income'
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
import type { Income } from '@/lib/types/database'
import { toast } from 'sonner'

interface IncomeFormProps {
  monthId: string
  income?: Income
  onSuccess?: () => void
}

export function IncomeForm({ monthId, income, onSuccess }: IncomeFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const today = format(new Date(), 'yyyy-MM-dd')

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm<IncomeInput>({
    resolver: zodResolver(incomeSchema),
    mode: 'onBlur',
    defaultValues: income
      ? {
          date: income.date,
          amount: Number(income.amount),
          source_type: income.source_type,
          custom_source: income.custom_source || '',
          notes: income.notes || '',
        }
      : {
          date: today,
          amount: undefined as any,
          source_type: 'Fizetés',
          custom_source: '',
          notes: '',
        },
  })

  const sourceType = watch('source_type')

  const onSubmit = async (data: IncomeInput) => {
    setIsLoading(true)

    try {
      const result = income
        ? await updateIncome({ ...data, id: income.id })
        : await createIncome({ ...data, month_id: monthId })

      if (result.error) {
        toast.error('Hiba történt', {
          description: result.error,
        })
      } else {
        toast.success(income ? 'Bevétel frissítve' : 'Bevétel hozzáadva', {
          description: income
            ? 'A bevétel sikeresen frissítve.'
            : 'Az új bevétel sikeresen hozzáadva.',
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
        <Label htmlFor="amount">Összeg (Ft)</Label>
        <Input
          id="amount"
          type="number"
          step="0.01"
          placeholder="pl. 250000"
          {...register('amount', { valueAsNumber: true })}
          className={errors.amount ? 'border-red-500' : ''}
          disabled={isLoading}
        />
        {errors.amount && (
          <p className="text-sm text-red-500">{errors.amount.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="source_type">Forrás típusa</Label>
        <Select
          value={sourceType}
          onValueChange={(value) =>
            setValue('source_type', value as (typeof INCOME_SOURCE_TYPES)[number])
          }
          disabled={isLoading}
        >
          <SelectTrigger className={errors.source_type ? 'border-red-500' : ''}>
            <SelectValue placeholder="Válassz forrást" />
          </SelectTrigger>
          <SelectContent>
            {INCOME_SOURCE_TYPES.map((type) => (
              <SelectItem key={type} value={type}>
                {type}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.source_type && (
          <p className="text-sm text-red-500">{errors.source_type.message}</p>
        )}
      </div>

      {sourceType === 'Egyéb' && (
        <div className="space-y-2 bg-blue-50 dark:bg-blue-900/10 p-3 rounded-md">
          <Label htmlFor="custom_source">Forrás neve</Label>
          <Input
            id="custom_source"
            type="text"
            placeholder="pl. Szabadúszó munka"
            {...register('custom_source')}
            className={errors.custom_source ? 'border-red-500' : ''}
            disabled={isLoading}
          />
          {errors.custom_source && (
            <p className="text-sm text-red-500">{errors.custom_source.message}</p>
          )}
        </div>
      )}

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
          {income ? 'Frissítés' : 'Hozzáadás'}
        </Button>
      </div>
    </form>
  )
}
