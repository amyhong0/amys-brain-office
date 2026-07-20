export interface User {
  id: string
  email: string
  name: string
  picture: string
}

export interface AuthTokens {
  access_token: string
  refresh_token: string
}

export const getGoogleAuthUrl = () => {
  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID
  const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/auth/callback`
  const scope = 'openid profile email'
  
  return `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=${encodeURIComponent(scope)}`
}

export const loginWithGoogle = async (code: string) => {
  const response = await fetch('/api/auth', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ code }),
  })

  if (!response.ok) {
    throw new Error('Authentication failed')
  }

  return response.json()
}
