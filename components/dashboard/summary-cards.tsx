'use client'

import { ArrowDownIcon, ArrowUpIcon, WalletIcon, AlertTriangle } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface SummaryCardsProps {
  totalIncome: number
  totalExpenses: number
  startingBalance: number
}

export function SummaryCards({
  totalIncome,
  totalExpenses,
  startingBalance,
}: SummaryCardsProps) {
  const balance = startingBalance + totalIncome - totalExpenses

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('hu-HU', {
      style: 'currency',
      currency: 'HUF',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  return (
    <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Összes bevétel</CardTitle>
          <ArrowUpIcon className="h-4 w-4 text-green-600" aria-hidden="true" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-600 dark:text-green-400">
            {formatCurrency(totalIncome)}
          </div>
          <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
            Havi bevételek összesítve
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Összes kiadás</CardTitle>
          <ArrowDownIcon className="h-4 w-4 text-red-600" aria-hidden="true" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-red-600 dark:text-red-400">
            {formatCurrency(totalExpenses)}
          </div>
          <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
            Havi kiadások összesítve
          </p>
        </CardContent>
      </Card>

      <Card className={balance < 0 ? 'border-red-300 dark:border-red-700' : ''}>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Egyenleg</CardTitle>
          <div className="flex items-center gap-1">
            {balance < 0 && <AlertTriangle className="h-4 w-4 text-red-600" aria-hidden="true" />}
            <WalletIcon className="h-4 w-4 text-blue-600" aria-hidden="true" />
          </div>
        </CardHeader>
        <CardContent>
          <div
            className={`text-2xl font-bold ${
              balance >= 0
                ? 'text-blue-600 dark:text-blue-400'
                : 'text-red-600 dark:text-red-400'
            }`}
          >
            {formatCurrency(balance)}
          </div>
          <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
            Kezdő: {formatCurrency(startingBalance)} + Bevétel - Kiadás
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
