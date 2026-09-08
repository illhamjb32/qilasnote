// Client-side API helpers - call our secure API routes instead of direct Supabase

export async function getUserSettingsAPI() {
  const response = await fetch('/api/user-settings', {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
  })
  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Failed to fetch user settings')
  }
  return response.json()
}

export async function updateUserSettingsAPI(settings: {
  daily_target?: number
  daily_target_mpasi?: number
  notifications_enabled?: boolean
  reminder_interval?: number
}) {
  const response = await fetch('/api/user-settings', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(settings),
  })
  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Failed to update user settings')
  }
  return response.json()
}
