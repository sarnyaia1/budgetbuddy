'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import type { CreateIncomeInput, UpdateIncomeInput } from '@/lib/validations/income'
import type { Income } from '@/lib/types/database'

/**
 * Create income
 */
export async function createIncome(formData: CreateIncomeInput) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Nem vagy bejelentkezve' }
  }

  const { data, error } = await supabase
    .from('income')
    .insert({
      user_id: user.id,
      month_id: formData.month_id,
      date: formData.date,
      amount: formData.amount,
      source_type: formData.source_type,
      custom_source: formData.custom_source || null,
      notes: formData.notes || null,
    })
    .select()
    .single()

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/dashboard')
  return { data: data as Income }
}

/**
 * Get all income for a month
 */
export async function getIncomeByMonth(monthId: string) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Nem vagy bejelentkezve' }
  }

  const { data, error } = await supabase
    .from('income')
    .select('*')
    .eq('user_id', user.id)
    .eq('month_id', monthId)
    .is('deleted_at', null)
    .order('date', { ascending: false })
    .order('created_at', { ascending: false })

  if (error) {
    return { error: error.message }
  }

  return { data: data as Income[] }
}

/**
 * Update income
 */
export async function updateIncome(formData: UpdateIncomeInput) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Nem vagy bejelentkezve' }
  }

  const { id, ...updates } = formData

  const { data, error } = await supabase
    .from('income')
    .update({
      ...updates,
      custom_source: updates.custom_source || null,
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
  return { data: data as Income }
}

/**
 * Delete income (soft delete)
 */
export async function deleteIncome(incomeId: string) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Nem vagy bejelentkezve' }
  }

  const { error } = await supabase
    .from('income')
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', incomeId)
    .eq('user_id', user.id)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/dashboard')
  return { success: true }
}

/**
 * Get total income for a month
 */
export async function getTotalIncomeForMonth(monthId: string) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Nem vagy bejelentkezve' }
  }

  const { data, error } = await supabase
    .from('income')
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
