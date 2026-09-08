import { createClient } from './supabase-client'

const ALLOWED_EMAILS = [
  'ilhamjb23@gmail.com',
  'shaviraadianda123@gmail.com'
]

export async function signInWithGoogle() {
  const supabase = createClient()
  
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${window.location.origin}/auth/callback`,
    },
  })

  if (error) {
    console.error('Sign in error:', error)
    throw error
  }

  return data
}

export async function signOut() {
  const supabase = createClient()
  const { error } = await supabase.auth.signOut()
  
  if (error) {
    console.error('Sign out error:', error)
    throw error
  }
  
  window.location.href = '/login'
}

export function isEmailAllowed(email: string): boolean {
  return ALLOWED_EMAILS.includes(email)
}
