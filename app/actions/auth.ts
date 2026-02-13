'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import type { LoginInput, RegisterInput, ForgotPasswordInput, ResetPasswordInput } from '@/lib/validations/auth'

/**
 * Maps common Supabase English error messages to Hungarian translations
 */
function mapSupabaseError(message: string): string {
  const errorMap: Record<string, string> = {
    'Invalid login credentials': 'Hibás email cím vagy jelszó',
    'User already registered': 'Ez az email cím már regisztrálva van',
    'Email not confirmed': 'Az email cím még nem lett megerősítve',
    'Password should be at least 6 characters': 'A jelszónak legalább 6 karakter hosszúnak kell lennie',
    'New password should be different from the old password.': 'Az új jelszónak különböznie kell a régitől',
    'New password should be different': 'Az új jelszónak különböznie kell a régitől',
  }

  // Check exact match first
  if (errorMap[message]) {
    return errorMap[message]
  }

  // Check partial matches (e.g. rate limit messages may vary)
  const lowerMessage = message.toLowerCase()
  if (lowerMessage.includes('rate limit')) {
    return 'Túl sok kérés. Próbáld újra később.'
  }

  return message
}

/**
 * Login action
 */
export async function loginAction(formData: LoginInput, redirectTo?: string) {
  const supabase = await createClient()

  const { error } = await supabase.auth.signInWithPassword({
    email: formData.email,
    password: formData.password,
  })

  if (error) {
    return { error: mapSupabaseError(error.message) }
  }

  revalidatePath('/', 'layout')
  redirect(redirectTo || '/dashboard')
}

/**
 * Register action
 */
export async function registerAction(formData: RegisterInput) {
  const supabase = await createClient()

  const { error } = await supabase.auth.signUp({
    email: formData.email,
    password: formData.password,
    options: {
      data: {
        name: formData.name,
      },
      emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/auth/callback`,
    },
  })

  if (error) {
    return { error: mapSupabaseError(error.message) }
  }

  return { success: true }
}

/**
 * Logout action
 */
export async function logoutAction() {
  const supabase = await createClient()

  const { error } = await supabase.auth.signOut()

  if (error) {
    return { error: mapSupabaseError(error.message) }
  }

  revalidatePath('/', 'layout')
  redirect('/login')
}

/**
 * Forgot password action
 */
export async function forgotPasswordAction(formData: ForgotPasswordInput) {
  const supabase = await createClient()

  const { error } = await supabase.auth.resetPasswordForEmail(formData.email, {
    redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/auth/callback?next=/reset-password`,
  })

  if (error) {
    return { error: mapSupabaseError(error.message) }
  }

  return { success: true }
}

/**
 * Reset password action
 */
export async function resetPasswordAction({ password }: Pick<ResetPasswordInput, 'password'>) {
  const supabase = await createClient()

  const { error } = await supabase.auth.updateUser({ password })

  if (error) {
    return { error: mapSupabaseError(error.message) }
  }

  // Sign out after password change so user logs in with new password
  await supabase.auth.signOut()

  revalidatePath('/', 'layout')
  return { success: true }
}
