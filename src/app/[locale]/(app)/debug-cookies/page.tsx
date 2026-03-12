'use client';

import { useEffect, useState } from 'react';
import Cookies from 'js-cookie';
import { Auth } from '@/lib/constants';
import { Container } from '@/components/layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui';

export default function DebugCookiesPage() {
  const [cookieInfo, setCookieInfo] = useState<any>({});

  useEffect(() => {
    const authToken = Cookies.get(Auth.Tokens.AccessToken);
    const refreshToken = Cookies.get(Auth.Tokens.RefreshToken);
    const allCookies = Cookies.get();

    setCookieInfo({
      authToken: authToken || 'NOT FOUND',
      refreshToken: refreshToken || 'NOT FOUND',
      allCookies: Object.keys(allCookies),
      documentCookies: document.cookie,
      expectedCookieName: Auth.Tokens.AccessToken,
    });
  }, []);

  return (
    <Container className="py-8">
      <Card>
        <CardHeader>
          <CardTitle>🔍 Cookie Debug Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="font-bold mb-2">Expected Cookie Name:</h3>
            <code className="bg-muted p-2 rounded block">
              {cookieInfo.expectedCookieName}
            </code>
          </div>

          <div>
            <h3 className="font-bold mb-2">Auth Token Found:</h3>
            <code className="bg-muted p-2 rounded block break-all">
              {cookieInfo.authToken}
            </code>
          </div>

          <div>
            <h3 className="font-bold mb-2">Refresh Token Found:</h3>
            <code className="bg-muted p-2 rounded block break-all">
              {cookieInfo.refreshToken}
            </code>
          </div>

          <div>
            <h3 className="font-bold mb-2">All Available Cookies:</h3>
            <pre className="bg-muted p-2 rounded block overflow-auto">
              {JSON.stringify(cookieInfo.allCookies, null, 2)}
            </pre>
          </div>

          <div>
            <h3 className="font-bold mb-2">Raw document.cookie:</h3>
            <pre className="bg-muted p-2 rounded block overflow-auto text-xs">
              {cookieInfo.documentCookies}
            </pre>
          </div>

          <div className="pt-4 border-t">
            <h3 className="font-bold mb-2">Environment Info:</h3>
            <pre className="bg-muted p-2 rounded block overflow-auto text-xs">
              {JSON.stringify({
                hostname: typeof window !== 'undefined' ? window.location.hostname : 'N/A',
                origin: typeof window !== 'undefined' ? window.location.origin : 'N/A',
                env: process.env.NEXT_PUBLIC_ENV,
              }, null, 2)}
            </pre>
          </div>
        </CardContent>
      </Card>
    </Container>
  );
}
