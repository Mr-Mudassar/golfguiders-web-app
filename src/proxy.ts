import { Auth, Locales } from '@/lib/constants';
import { locales, defaultLocale } from './i18n/config';
import createIntlMiddleware from 'next-intl/middleware';
import { type NextRequest, NextResponse } from 'next/server';


const intlMiddleware = createIntlMiddleware({
  locales,
  defaultLocale,
  localePrefix: 'always',
});

export default async function proxy(req: NextRequest) {
  const pathname = req.nextUrl?.pathname ?? '/';
  const locale =
    req.cookies.get('NEXT_LOCALE')?.value || Locales.Default.Locale;

  const normalizedPathname = pathname.startsWith(`/${locale}`)
    ? pathname.replace(`/${locale}`, '') || '/'
    : pathname;

  // Allow logout-receiver without authentication (for cross-domain logout)
  if (normalizedPathname.includes('/logout-receiver')) {
    return intlMiddleware(req);
  }

  const accessToken = req.cookies.get(Auth.Tokens.AccessToken)?.value;

  const isHomePage = normalizedPathname === '/';
  const isOnboardPage = pathname.includes('/onboarding');
  const isAuthPage = normalizedPathname.includes('/auth');
  const isDashboardPage = normalizedPathname.includes('/dashboard');

  // Handle redirects
  if (isHomePage) {
    if (accessToken) {
      // User is authenticated, redirect to dashboard
      return NextResponse.redirect(
        new URL(`/${locale}/dashboard`, req.nextUrl.origin)
      );
    } else {
      // User is not authenticated, redirect to auth portal
      return NextResponse.redirect(
        new URL(process.env.NEXT_PUBLIC_AUTH_URL!, req.nextUrl.origin)
      );
    }
  }

  if (accessToken && isAuthPage && !isOnboardPage) {
    return NextResponse.redirect(
      new URL(`/${locale}/dashboard`, req.nextUrl.origin)
    );
  }

  if (!accessToken && isDashboardPage && !isOnboardPage) {
    return NextResponse.redirect(
      new URL(process.env.NEXT_PUBLIC_AUTH_URL, req.nextUrl.origin)
    );
  }

  return intlMiddleware(req);
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|.*\\.).*)',
  ],
};
