import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

function isCRORole(role: string | undefined) {
  return role === 'cro'
}

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // IMPORTANT: use getUser() not getSession() — getSession() does not verify the JWT
  const { data: { user } } = await supabase.auth.getUser()

  const { pathname } = request.nextUrl

  // Already-logged-in users hitting auth pages → redirect to role home
  if (user && (pathname === '/login' || pathname === '/register')) {
    const role = user.user_metadata.role as string
    const home = isCRORole(role) ? '/cro/projects' : '/clinic/profile'
    return NextResponse.redirect(new URL(home, request.url))
  }

  // Unauthenticated users hitting protected routes → login
  const isProtected =
    pathname.startsWith('/cro') || pathname.startsWith('/clinic')
  if (!user && isProtected) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // Wrong-role access
  if (user) {
    const role = user.user_metadata.role as string
    if (isCRORole(role) && pathname.startsWith('/clinic')) {
      return NextResponse.redirect(new URL('/cro/projects', request.url))
    }
    if (role === 'clinic_admin' && pathname.startsWith('/cro')) {
      return NextResponse.redirect(new URL('/clinic/profile', request.url))
    }
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
