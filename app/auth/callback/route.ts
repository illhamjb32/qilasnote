import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-server'
import { isEmailAllowed } from '@/lib/auth'

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')

  if (code) {
    const supabase = await createClient()
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)

    if (error) {
      console.error('Error exchanging code:', error)
      return NextResponse.redirect(`${requestUrl.origin}/login?error=auth_failed`)
    }

    const user = data.user
    if (user && !isEmailAllowed(user.email || '')) {
      await supabase.auth.signOut()
      return NextResponse.redirect(`${requestUrl.origin}/login?error=unauthorized&email=${encodeURIComponent(user.email || '')}`)
    }

    return NextResponse.redirect(`${requestUrl.origin}/`)
  }

  return NextResponse.redirect(`${requestUrl.origin}/login`)
}
