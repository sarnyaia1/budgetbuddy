'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import type { Month } from '@/lib/types/database'

/**
 * Get or create a month for the user
 * This is the primary method - auto-creates if doesn't exist
 */
export async function getOrCreateMonth(year: number, month: number) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Nem vagy bejelentkezve' }
  }

  // Try to find existing month
  const { data: existingMonth, error: fetchError } = await supabase
    .from('months')
    .select('*')
    .eq('user_id', user.id)
    .eq('year', year)
    .eq('month', month)
    .is('deleted_at', null)
    .single()

  if (existingMonth) {
    return { data: existingMonth as Month }
  }

  // Create new month if doesn't exist
  const { data: newMonth, error: createError } = await supabase
    .from('months')
    .insert({
      user_id: user.id,
      year,
      month,
      starting_balance: 0,
    })
    .select()
    .single()

  if (createError) {
    return { error: createError.message }
  }

  // Don't revalidate here - this is called during render
  return { data: newMonth as Month }
}

/**
 * Get all months for the current user
 */
export async function getMonths() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Nem vagy bejelentkezve' }
  }

  const { data, error } = await supabase
    .from('months')
    .select('*')
    .eq('user_id', user.id)
    .is('deleted_at', null)
    .order('year', { ascending: false })
    .order('month', { ascending: false })

  if (error) {
    return { error: error.message }
  }

  return { data: data as Month[] }
}

/**
 * Update month starting balance
 */
export async function updateMonthStartingBalance(
  monthId: string,
  startingBalance: number
) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Nem vagy bejelentkezve' }
  }

  const { data, error } = await supabase
    .from('months')
    .update({ starting_balance: startingBalance })
    .eq('id', monthId)
    .eq('user_id', user.id)
    .select()
    .single()

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/dashboard')
  return { data: data as Month }
}

/**
 * Delete month (soft delete)
 */
export async function deleteMonth(monthId: string) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Nem vagy bejelentkezve' }
  }

  const { error } = await supabase
    .from('months')
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', monthId)
    .eq('user_id', user.id)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/dashboard')
  return { success: true }
}
