'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Cookies from 'js-cookie';
import { Auth } from '@/lib/constants';
import { Loader } from 'lucide-react';

/**
 * Auth Callback Page
 *
 * This page handles the redirect from the centralized auth portal
 * (auth-dev.golfguiders.com or auth.golfguiders.com) after successful login.
 *
 * Flow:
 * 1. User logs in on auth portal
 * 2. Auth portal redirects to: http://localhost:3000/[locale]/auth/callback?token=xxx
 * 3. This page extracts the token from URL
 * 4. Stores token in cookie
 * 5. Redirects to dashboard
 */
export default function AuthCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    // Extract token from URL query parameters
    const token = searchParams.get('token');
    const refreshToken = searchParams.get('refresh_token');
    const error = searchParams.get('error');

    // Handle auth error
    if (error) {
      console.error('Authentication error:', error);
      // Redirect to auth portal with error
      router.push(process.env.NEXT_PUBLIC_AUTH_URL as string);
      return;
    }

    // Validate token exists
    if (!token) {
      console.error('No token received from auth portal');
      router.push(process.env.NEXT_PUBLIC_AUTH_URL as string);
      return;
    }

    try {
      // Store access token in cookie
      Cookies.set(Auth.Tokens.AccessToken, token, {
        expires: Auth.Tokens.ExpirationTime, // 2 days
        secure: process.env.NEXT_PUBLIC_ENV === 'prod',
        sameSite: 'lax',
      });

      // Store refresh token if provided
      if (refreshToken) {
        Cookies.set(Auth.Tokens.RefreshToken, refreshToken, {
          expires: 30, // 30 days
          secure: process.env.NEXT_PUBLIC_ENV === 'prod',
          sameSite: 'lax',
        });
      }

      console.log('✅ Authentication successful, redirecting to dashboard...');

      // Use window.location for hard redirect to ensure cookies are set
      // This forces a full page reload which ensures middleware picks up the new cookie
      // Note: AbortError in console is expected - it's from React cleanup during navigation
      window.location.href = '/dashboard';
    } catch (error) {
      console.error('Failed to store authentication token:', error);
      router.push(process.env.NEXT_PUBLIC_AUTH_URL as string);
    }
  }, [searchParams, router]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-4">
        <Loader className="h-8 w-8 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">
          Completing authentication...
        </p>
      </div>
    </div>
  );
}
