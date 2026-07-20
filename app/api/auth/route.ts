import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  const { code } = await request.json()

  if (!code) {
    return NextResponse.json({ error: 'Authorization code is required' }, { status: 400 })
  }

  try {
    const clientId = process.env.GOOGLE_CLIENT_ID
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET
    const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/auth/callback`

    const response = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: clientId!,
        client_secret: clientSecret!,
        redirect_uri: redirectUri,
        grant_type: 'authorization_code',
      }),
    })

    const tokens = await response.json()

    // Get user info
    const userResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: { Authorization: `Bearer ${tokens.access_token}` },
    })

    const user = await userResponse.json()

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        picture: user.picture,
      },
      tokens: {
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token,
      },
    })
  } catch (error) {
    console.error('OAuth error:', error)
    return NextResponse.json({ error: 'Authentication failed' }, { status: 500 })
  }
}
