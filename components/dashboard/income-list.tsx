'use client'

import { useState } from 'react'
import { format, parseISO } from 'date-fns'
import { hu } from 'date-fns/locale'
import { Pencil, Trash2 } from 'lucide-react'
import { deleteIncome } from '@/app/actions/income'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { IncomeForm } from '@/components/forms/income-form'
import type { Income } from '@/lib/types/database'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'

interface IncomeListProps {
  incomes: Income[]
  monthId: string
}

export function IncomeList({ incomes, monthId }: IncomeListProps) {
  const [editingIncome, setEditingIncome] = useState<Income | null>(null)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const router = useRouter()

  const handleDelete = async (incomeId: string) => {
    if (!confirm('Biztosan törölni szeretnéd ezt a bevételt?')) {
      return
    }

    const result = await deleteIncome(incomeId)

    if (result.error) {
      toast.error('Hiba történt', {
        description: result.error,
      })
    } else {
      toast.success('Bevétel törölve', {
        description: 'A bevétel sikeresen törölve.',
      })
      router.refresh()
    }
  }

  const handleEdit = (income: Income) => {
    setEditingIncome(income)
    setIsEditDialogOpen(true)
  }

  const handleEditSuccess = () => {
    setIsEditDialogOpen(false)
    setEditingIncome(null)
    router.refresh()
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('hu-HU', {
      style: 'currency',
      currency: 'HUF',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  if (incomes.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500 dark:text-gray-400">
        Még nincs rögzített bevétel ebben a hónapban.
      </div>
    )
  }

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Dátum</TableHead>
              <TableHead>Forrás</TableHead>
              <TableHead className="text-right">Összeg</TableHead>
              <TableHead>Megjegyzés</TableHead>
              <TableHead className="text-right">Műveletek</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {incomes.map((income) => (
              <TableRow key={income.id}>
                <TableCell>
                  {format(parseISO(income.date), 'yyyy. MMM dd.', { locale: hu })}
                </TableCell>
                <TableCell>
                  {income.source_type === 'Egyéb'
                    ? income.custom_source || 'Egyéb'
                    : income.source_type}
                </TableCell>
                <TableCell className="text-right font-medium text-green-600 dark:text-green-400">
                  {formatCurrency(Number(income.amount))}
                </TableCell>
                <TableCell className="text-gray-600 dark:text-gray-400 max-w-[200px] truncate">
                  {income.notes || '-'}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEdit(income)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(income.id)}
                    >
                      <Trash2 className="h-4 w-4 text-red-600" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Bevétel szerkesztése</DialogTitle>
            <DialogDescription>
              Módosítsd a bevétel adatait az alábbi űrlapon.
            </DialogDescription>
          </DialogHeader>
          {editingIncome && (
            <IncomeForm
              monthId={monthId}
              income={editingIncome}
              onSuccess={handleEditSuccess}
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}
