import createIntlMiddleware from 'next-intl/middleware';
import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';
import { routing } from './i18n/routing';

const intlMiddleware = createIntlMiddleware(routing);

// Only these routes read or depend on the auth session — everywhere else
// (catalog, product pages, home, static content) skips the Supabase round
// trip entirely, since it was adding a network call to every navigation.
const AUTH_ROUTE_PATTERN = /^\/(ru|en|it)\/(account|login|register|forgot-password|reset-password)(\/|$)/;

export async function middleware(request: NextRequest) {
  // Run next-intl locale routing first
  const intlResponse = intlMiddleware(request);

  // Use the intl response as base (may be a redirect for locale detection)
  let response = intlResponse;

  const { pathname } = request.nextUrl;
  const needsAuthRefresh = AUTH_ROUTE_PATTERN.test(pathname) || pathname.startsWith('/auth/');
  if (!needsAuthRefresh) {
    return response;
  }

  // Refresh Supabase session (auth-dependent routes only)
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          // Copy intl headers to new response
          intlResponse.headers.forEach((value, key) => {
            response.headers.set(key, value);
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  await supabase.auth.getUser();
  return response;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|icon|apple-icon|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
};
