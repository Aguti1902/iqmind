import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const supportedLocales = ['es', 'en', 'fr', 'de', 'it', 'pt', 'sv', 'no', 'uk']
const defaultLocale = 'es'

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  if (pathname.startsWith('/.well-known')) {
    return NextResponse.next()
  }

  const pathnameHasLocale = supportedLocales.some(
    (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
  )

  if (pathnameHasLocale) {
    return NextResponse.next()
  }

  if (pathname === '/') {
    return NextResponse.next()
  }

  const locale = defaultLocale
  request.nextUrl.pathname = `/${locale}${pathname}`
  return NextResponse.redirect(request.nextUrl)
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|images|favicon.ico|messages|\\.well-known|.*\\.html).*)',
  ],
}

