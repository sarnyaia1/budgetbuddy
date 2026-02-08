'use client'

import { useState } from 'react'
import { format, parseISO } from 'date-fns'
import { hu } from 'date-fns/locale'
import { Pencil, Trash2 } from 'lucide-react'
import { deleteExpense } from '@/app/actions/expenses'
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
import { ExpenseForm } from '@/components/forms/expense-form'
import type { Expense } from '@/lib/types/database'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'

interface ExpenseListProps {
  expenses: Expense[]
  monthId: string
}

export function ExpenseList({ expenses, monthId }: ExpenseListProps) {
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const router = useRouter()

  const handleDelete = async (expenseId: string) => {
    if (!confirm('Biztosan törölni szeretnéd ezt a kiadást?')) {
      return
    }

    const result = await deleteExpense(expenseId)

    if (result.error) {
      toast.error('Hiba történt', {
        description: result.error,
      })
    } else {
      toast.success('Kiadás törölve', {
        description: 'A kiadás sikeresen törölve.',
      })
      router.refresh()
    }
  }

  const handleEdit = (expense: Expense) => {
    setEditingExpense(expense)
    setIsEditDialogOpen(true)
  }

  const handleEditSuccess = () => {
    setIsEditDialogOpen(false)
    setEditingExpense(null)
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

  if (expenses.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500 dark:text-gray-400">
        Még nincs rögzített kiadás ebben a hónapban.
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
              <TableHead>Tétel</TableHead>
              <TableHead>Kategória</TableHead>
              <TableHead className="text-right">Összeg</TableHead>
              <TableHead>Megjegyzés</TableHead>
              <TableHead className="text-right">Műveletek</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {expenses.map((expense) => (
              <TableRow key={expense.id}>
                <TableCell>
                  {format(parseISO(expense.date), 'yyyy. MMM dd.', { locale: hu })}
                </TableCell>
                <TableCell className="font-medium">{expense.item_name}</TableCell>
                <TableCell>
                  <span className="inline-flex items-center rounded-full bg-blue-50 dark:bg-blue-900/20 px-2 py-1 text-xs font-medium text-blue-700 dark:text-blue-300">
                    {expense.category}
                  </span>
                </TableCell>
                <TableCell className="text-right font-medium text-red-600 dark:text-red-400">
                  {formatCurrency(Number(expense.amount))}
                </TableCell>
                <TableCell className="text-gray-600 dark:text-gray-400 max-w-[200px] truncate">
                  {expense.notes || '-'}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEdit(expense)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(expense.id)}
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
            <DialogTitle>Kiadás szerkesztése</DialogTitle>
            <DialogDescription>
              Módosítsd a kiadás adatait az alábbi űrlapon.
            </DialogDescription>
          </DialogHeader>
          {editingExpense && (
            <ExpenseForm
              monthId={monthId}
              expense={editingExpense}
              onSuccess={handleEditSuccess}
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}
