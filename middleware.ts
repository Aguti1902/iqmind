import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const supportedLocales = ['es', 'en', 'fr', 'de', 'it', 'pt', 'sv', 'no', 'uk']
const defaultLocale = 'es'

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Skip verification files
  if (pathname === '/primePayments.txt' || pathname.endsWith('.txt')) {
    return NextResponse.next()
  }

  // Verificar si la ruta ya tiene un idioma
  const pathnameHasLocale = supportedLocales.some(
    (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
  )

  if (pathnameHasLocale) {
    return NextResponse.next()
  }

  // Si es la raíz, dejar que el componente cliente maneje la redirección
  if (pathname === '/') {
    return NextResponse.next()
  }

  // Para otras rutas sin idioma, redirigir a español
  const locale = defaultLocale
  request.nextUrl.pathname = `/${locale}${pathname}`
  return NextResponse.redirect(request.nextUrl)
}

export const config = {
  matcher: [
    // Skip all internal paths (_next, api, etc)
    '/((?!api|_next/static|_next/image|images|favicon.ico|messages).*)',
  ],
}

