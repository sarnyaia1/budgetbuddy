import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const next = requestUrl.searchParams.get('next') || '/dashboard'
  const errorParam = requestUrl.searchParams.get('error')
  const errorDescription = requestUrl.searchParams.get('error_description')
  const origin = requestUrl.origin

  // Handle error from Supabase (e.g. expired or invalid link)
  if (errorParam) {
    const message = errorDescription || 'Hitelesítési hiba történt. Próbáld újra.'
    return NextResponse.redirect(
      `${origin}/login?error=${encodeURIComponent(message)}`
    )
  }

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (error) {
      return NextResponse.redirect(
        `${origin}/login?error=${encodeURIComponent('A megerősítő link érvénytelen vagy lejárt. Kérj új linket.')}`
      )
    }

    // Redirect to the intended destination (e.g. /reset-password or /dashboard)
    return NextResponse.redirect(`${origin}${next}`)
  }

  // No code provided — redirect to login with error
  return NextResponse.redirect(
    `${origin}/login?error=${encodeURIComponent('Hiányzó hitelesítő kód. Kérj új linket.')}`
  )
}
