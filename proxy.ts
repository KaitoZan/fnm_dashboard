// proxy.ts
import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import { getCookie, setCookie } from 'cookies-next'
import type { Database } from '@/types/supabase'

export async function proxy(req: NextRequest) {
  const res = NextResponse.next()

  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return getCookie(name, { req, res })?.toString()
        },

        set(name: string, value: string, options: CookieOptions) {
          const cookieOptions: CookieOptions = {
            ...options,
            secure: true, // <<< ต้องมีใน Vercel (HTTPS)
            sameSite: 'lax',
            path: options.path ?? '/',
          }

          setCookie(name, value, {
            req,
            res,
            ...cookieOptions,
          })
        },

        remove(name: string, options: CookieOptions) {
          const cookieOptions: CookieOptions = {
            ...options,
            secure: true,
            sameSite: 'lax',
            path: options.path ?? '/',
          }

          setCookie(name, '', {
            req,
            res,
            ...cookieOptions,
          })
        },
      },
    }
  )

  // Refresh Session
  const {
    data: { session },
  } = await supabase.auth.getSession()

  const { pathname } = req.nextUrl

  // Redirect rules
  if (!session && pathname !== '/login') {
    return NextResponse.redirect(new URL('/login', req.url))
  }

  if (session && pathname === '/login') {
    return NextResponse.redirect(new URL('/dashboard', req.url))
  }

  return res
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}
