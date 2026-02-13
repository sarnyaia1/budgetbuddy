'use client'

import { useState } from 'react'
import { format, parseISO } from 'date-fns'
import { hu } from 'date-fns/locale'
import { Pencil, Trash2, Plus, ArrowDownIcon } from 'lucide-react'
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { ExpenseForm } from '@/components/forms/expense-form'
import type { Expense } from '@/lib/types/database'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'

const categoryColors: Record<string, string> = {
  'Bevásárlás': 'bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300',
  'Szórakozás': 'bg-purple-50 text-purple-700 dark:bg-purple-900/20 dark:text-purple-300',
  'Vendéglátás': 'bg-orange-50 text-orange-700 dark:bg-orange-900/20 dark:text-orange-300',
  'Extra': 'bg-rose-50 text-rose-700 dark:bg-rose-900/20 dark:text-rose-300',
  'Utazás': 'bg-teal-50 text-teal-700 dark:bg-teal-900/20 dark:text-teal-300',
  'Kötelező kiadás': 'bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-300',
  'Ruha': 'bg-pink-50 text-pink-700 dark:bg-pink-900/20 dark:text-pink-300',
  'Sport': 'bg-indigo-50 text-indigo-700 dark:bg-indigo-900/20 dark:text-indigo-300',
}

interface ExpenseListProps {
  expenses: Expense[]
  monthId: string
  onAddNew?: () => void
}

export function ExpenseList({ expenses, monthId, onAddNew }: ExpenseListProps) {
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<Expense | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const router = useRouter()

  const handleDelete = async () => {
    if (!deleteTarget) return
    setIsDeleting(true)

    const result = await deleteExpense(deleteTarget.id)

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
    setIsDeleting(false)
    setDeleteTarget(null)
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

  const getCategoryColor = (category: string) => {
    return categoryColors[category] || 'bg-gray-50 text-gray-700 dark:bg-gray-900/20 dark:text-gray-300'
  }

  if (expenses.length === 0) {
    return (
      <div className="text-center py-8">
        <ArrowDownIcon className="h-10 w-10 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
        <p className="text-gray-500 dark:text-gray-400 mb-4">
          Még nincs rögzített kiadás ebben a hónapban.
        </p>
        {onAddNew && (
          <Button variant="outline" size="sm" onClick={onAddNew}>
            <Plus className="h-4 w-4 mr-2" />
            Új kiadás hozzáadása
          </Button>
        )}
      </div>
    )
  }

  return (
    <TooltipProvider>
      {/* Desktop table view */}
      <div className="hidden sm:block rounded-md border">
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
                  <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${getCategoryColor(expense.category)}`}>
                    {expense.category}
                  </span>
                </TableCell>
                <TableCell className="text-right font-medium text-red-600 dark:text-red-400">
                  <span className="inline-flex items-center gap-1">
                    <ArrowDownIcon className="h-3 w-3" />
                    {formatCurrency(Number(expense.amount))}
                  </span>
                </TableCell>
                <TableCell className="text-gray-600 dark:text-gray-400 max-w-[200px]">
                  {expense.notes ? (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <span className="truncate block cursor-default">{expense.notes}</span>
                      </TooltipTrigger>
                      <TooltipContent className="max-w-xs">
                        <p>{expense.notes}</p>
                      </TooltipContent>
                    </Tooltip>
                  ) : (
                    <span className="text-gray-400">-</span>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEdit(expense)}
                      aria-label={`Kiadás szerkesztése: ${expense.item_name}`}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setDeleteTarget(expense)}
                      aria-label={`Kiadás törlése: ${expense.item_name}`}
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

      {/* Mobile card view */}
      <div className="sm:hidden space-y-3">
        {expenses.map((expense) => (
          <div
            key={expense.id}
            className="rounded-lg border bg-white dark:bg-gray-800 p-4 shadow-sm"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {format(parseISO(expense.date), 'MMM dd.', { locale: hu })}
                  </span>
                  <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${getCategoryColor(expense.category)}`}>
                    {expense.category}
                  </span>
                </div>
                <p className="font-medium text-gray-900 dark:text-white text-sm mb-1">
                  {expense.item_name}
                </p>
                <div className="text-lg font-bold text-red-600 dark:text-red-400 flex items-center gap-1">
                  <ArrowDownIcon className="h-4 w-4" />
                  {formatCurrency(Number(expense.amount))}
                </div>
                {expense.notes && (
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 truncate">
                    {expense.notes}
                  </p>
                )}
              </div>
              <div className="flex gap-1 ml-2 shrink-0">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleEdit(expense)}
                  aria-label="Szerkesztés"
                  className="h-8 w-8 p-0"
                >
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setDeleteTarget(expense)}
                  aria-label="Törlés"
                  className="h-8 w-8 p-0"
                >
                  <Trash2 className="h-4 w-4 text-red-600" />
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Delete confirmation dialog */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Biztosan törölni szeretnéd?</AlertDialogTitle>
            <AlertDialogDescription>
              Ez a művelet nem vonható vissza.
              {deleteTarget && ` A "${deleteTarget.item_name}" tétel (${formatCurrency(Number(deleteTarget.amount))})`} véglegesen törölve lesz.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Mégsem</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
            >
              {isDeleting ? 'Törlés...' : 'Törlés'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Edit dialog */}
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
    </TooltipProvider>
  )
}
