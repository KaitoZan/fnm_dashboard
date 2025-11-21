// middleware.ts
import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import { getCookie, setCookie } from 'cookies-next' // (1) Import getCookie และ setCookie
import type { Database } from '@/types/supabase'

export async function proxy(req: NextRequest) {
  const res = NextResponse.next()

  // (2) สร้าง Client ด้วย createServerClient (ไม่ใช่ createMiddlewareClient)
  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        // (3) ใช้วิธีของ cookies-next ในการ Get/Set/Remove
        get(name: string) {
          return getCookie(name, { req, res })
        },
        set(name: string, value: string, options: CookieOptions) {
          setCookie(name, value, { req, res, ...options })
        },
        remove(name: string, options: CookieOptions) {
          setCookie(name, '', { req, res, ...options })
        },
      },
    }
  )

  // (4) รีเฟรช Session (เหมือนเดิม)
  const {
    data: { session },
  } = await supabase.auth.getSession()

  const { pathname } = req.nextUrl

  // (5) Logic การ Redirect (เหมือนเดิม)
  if (!session && pathname !== '/login') {
    return NextResponse.redirect(new URL('/login', req.url))
  }

  if (session && pathname === '/login') {
    return NextResponse.redirect(new URL('/dashboard', req.url))
  }

  return res
}

// (Config เหมือนเดิม)
export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}