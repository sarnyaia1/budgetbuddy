'use client'

import { useState } from 'react'
import { format, parseISO } from 'date-fns'
import { hu } from 'date-fns/locale'
import { Pencil, Trash2, Plus, ArrowUpIcon } from 'lucide-react'
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
import { IncomeForm } from '@/components/forms/income-form'
import type { Income } from '@/lib/types/database'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'

interface IncomeListProps {
  incomes: Income[]
  monthId: string
  onAddNew?: () => void
}

export function IncomeList({ incomes, monthId, onAddNew }: IncomeListProps) {
  const [editingIncome, setEditingIncome] = useState<Income | null>(null)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<Income | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const router = useRouter()

  const handleDelete = async () => {
    if (!deleteTarget) return
    setIsDeleting(true)

    const result = await deleteIncome(deleteTarget.id)

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
    setIsDeleting(false)
    setDeleteTarget(null)
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
      <div className="text-center py-8">
        <ArrowUpIcon className="h-10 w-10 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
        <p className="text-gray-500 dark:text-gray-400 mb-4">
          Még nincs rögzített bevétel ebben a hónapban.
        </p>
        {onAddNew && (
          <Button variant="outline" size="sm" onClick={onAddNew}>
            <Plus className="h-4 w-4 mr-2" />
            Új bevétel hozzáadása
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
                  <span className="inline-flex items-center gap-1">
                    <ArrowUpIcon className="h-3 w-3" />
                    {formatCurrency(Number(income.amount))}
                  </span>
                </TableCell>
                <TableCell className="text-gray-600 dark:text-gray-400 max-w-[200px]">
                  {income.notes ? (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <span className="truncate block cursor-default">{income.notes}</span>
                      </TooltipTrigger>
                      <TooltipContent className="max-w-xs">
                        <p>{income.notes}</p>
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
                      onClick={() => handleEdit(income)}
                      aria-label={`Bevétel szerkesztése: ${formatCurrency(Number(income.amount))}`}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setDeleteTarget(income)}
                      aria-label={`Bevétel törlése: ${formatCurrency(Number(income.amount))}`}
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
        {incomes.map((income) => (
          <div
            key={income.id}
            className="rounded-lg border bg-white dark:bg-gray-800 p-4 shadow-sm"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {format(parseISO(income.date), 'MMM dd.', { locale: hu })}
                  </span>
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {income.source_type === 'Egyéb'
                      ? income.custom_source || 'Egyéb'
                      : income.source_type}
                  </span>
                </div>
                <div className="text-lg font-bold text-green-600 dark:text-green-400 flex items-center gap-1">
                  <ArrowUpIcon className="h-4 w-4" />
                  {formatCurrency(Number(income.amount))}
                </div>
                {income.notes && (
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 truncate">
                    {income.notes}
                  </p>
                )}
              </div>
              <div className="flex gap-1 ml-2 shrink-0">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleEdit(income)}
                  aria-label="Szerkesztés"
                  className="h-8 w-8 p-0"
                >
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setDeleteTarget(income)}
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
              Ez a művelet nem vonható vissza. A bevétel
              {deleteTarget && ` (${formatCurrency(Number(deleteTarget.amount))})`} véglegesen törölve lesz.
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
    </TooltipProvider>
  )
}
