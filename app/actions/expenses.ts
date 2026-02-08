'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import type { CreateExpenseInput, UpdateExpenseInput } from '@/lib/validations/expense'
import type { Expense, ExpensesByCategory } from '@/lib/types/database'

/**
 * Create expense
 */
export async function createExpense(formData: CreateExpenseInput) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Nem vagy bejelentkezve' }
  }

  const { data, error } = await supabase
    .from('expenses')
    .insert({
      user_id: user.id,
      month_id: formData.month_id,
      date: formData.date,
      amount: formData.amount,
      item_name: formData.item_name,
      category: formData.category,
      notes: formData.notes || null,
    })
    .select()
    .single()

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/dashboard')
  return { data: data as Expense }
}

/**
 * Get all expenses for a month
 */
export async function getExpensesByMonth(monthId: string) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Nem vagy bejelentkezve' }
  }

  const { data, error } = await supabase
    .from('expenses')
    .select('*')
    .eq('user_id', user.id)
    .eq('month_id', monthId)
    .is('deleted_at', null)
    .order('date', { ascending: false })
    .order('created_at', { ascending: false })

  if (error) {
    return { error: error.message }
  }

  return { data: data as Expense[] }
}

/**
 * Update expense
 */
export async function updateExpense(formData: UpdateExpenseInput) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Nem vagy bejelentkezve' }
  }

  const { id, ...updates } = formData

  const { data, error } = await supabase
    .from('expenses')
    .update({
      ...updates,
      notes: updates.notes || null,
    })
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single()

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/dashboard')
  return { data: data as Expense }
}

/**
 * Delete expense (soft delete)
 */
export async function deleteExpense(expenseId: string) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Nem vagy bejelentkezve' }
  }

  const { error } = await supabase
    .from('expenses')
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', expenseId)
    .eq('user_id', user.id)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/dashboard')
  return { success: true }
}

/**
 * Get total expenses for a month
 */
export async function getTotalExpensesForMonth(monthId: string) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Nem vagy bejelentkezve' }
  }

  const { data, error } = await supabase
    .from('expenses')
    .select('amount')
    .eq('user_id', user.id)
    .eq('month_id', monthId)
    .is('deleted_at', null)

  if (error) {
    return { error: error.message }
  }

  const total = data.reduce((sum, item) => sum + Number(item.amount), 0)
  return { data: total }
}

/**
 * Get expenses by category for a month
 */
export async function getExpensesByCategory(monthId: string) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Nem vagy bejelentkezve' }
  }

  const { data, error } = await supabase
    .from('expenses')
    .select('category, amount')
    .eq('user_id', user.id)
    .eq('month_id', monthId)
    .is('deleted_at', null)

  if (error) {
    return { error: error.message }
  }

  // Group by category
  const grouped = data.reduce(
    (acc, item) => {
      const category = item.category
      if (!acc[category]) {
        acc[category] = { category, total: 0, count: 0 }
      }
      acc[category].total += Number(item.amount)
      acc[category].count += 1
      return acc
    },
    {} as Record<string, ExpensesByCategory>
  )

  return { data: Object.values(grouped) }
}
