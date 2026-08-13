import { betterAuth } from 'better-auth'
import { pool } from '@/lib/db'

const isProduction = process.env.NODE_ENV === 'production'

const normalizeURL = (url: string): string => {
  if (!url) return ''
  if (url.startsWith('http://') || url.startsWith('https://')) return url
  return `https://${url}`
}

const getBaseURL = () => {
  if (process.env.BETTER_AUTH_URL) return process.env.BETTER_AUTH_URL
  if (process.env.VERCEL_PROJECT_PRODUCTION_URL) return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`
  if (process.env.V0_RUNTIME_URL) return normalizeURL(process.env.V0_RUNTIME_URL)
  return 'http://localhost:3000'
}

export const auth = betterAuth({
  database: pool,
  baseURL: getBaseURL(),
  secret: process.env.BETTER_AUTH_SECRET,
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
    },
  },
  trustedOrigins: [
    'http://localhost:3000',
    'http://localhost:3001',
    ...(process.env.V0_RUNTIME_URL ? [normalizeURL(process.env.V0_RUNTIME_URL)] : []),
    ...(process.env.VERCEL_URL ? [`https://${process.env.VERCEL_URL}`] : []),
    ...(process.env.VERCEL_PROJECT_PRODUCTION_URL
      ? [`https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`]
      : []),
    'https://v0-nccamp.vercel.app',
    // Support v0 sandbox environments (vusercontent.net domains vary)
    ...(process.env.NODE_ENV !== 'production' ? ['https://vm-v0-raulrayas-a9db9d99-68.vusercontent.net', 'https://vm-v0-raulrayas-a9db9d99.vusercontent.net'] : []),
  ],
  session: {
    expiresIn: 60 * 60 * 24 * 7,
    updateAge: 60 * 60 * 24,
    cookieAttributes: {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? 'lax' : 'lax',
      path: '/',
    },
  },
})
