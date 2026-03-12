'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { WifiOff, RefreshCw, Smartphone } from 'lucide-react';
import { Logo } from '@/components/common';
import Link from 'next/link';
import { useTranslations } from 'next-intl';

export default function NoInternetPage() {
  const [isRetrying, setIsRetrying] = useState(false);
  const [pulseAnimation, setPulseAnimation] = useState(true);
  const router = useRouter();

  const t = useTranslations('noInternetPage');
  // console.log('cooo', process.env.NEXT_PUBLIC_GRAPHQL_URI);

  useEffect(() => {
    const interval = setInterval(() => {
      setPulseAnimation((prev) => !prev);
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const checkInternetConnection = async (): Promise<boolean> => {
    try {
      // Try to fetch a small resource to check connectivity
      await fetch('/favicon.ico', {
        method: 'HEAD',
        cache: 'no-cache',
      });
      return navigator.onLine && navigator.userActivation.isActive;
    } catch {
      return navigator.onLine && navigator.userActivation.isActive;
    }
  };

  const handleRetry = async () => {
    setIsRetrying(true);

    try {
      await new Promise((resolve) => setTimeout(resolve, 1500));
      const isConnected = await checkInternetConnection();
      if (isConnected) {
        router.back();
      } else {
        setIsRetrying(false);

        const errorMessage = document.createElement('div');
        errorMessage.className =
          'fixed top-4 right-4 bg-red-500 text-foreground px-4 py-2 rounded-lg shadow-lg z-50 animate-pulse';
        errorMessage.textContent = 'Still no connection. Please try again.';
        document.body.appendChild(errorMessage);

        setTimeout(() => {
          document.body.removeChild(errorMessage);
        }, 3000);
      }
    } catch (error) {
      console.error('Error checking connection:', error);
      setIsRetrying(false);
    }
  };

  const handleDownloadApp = (val: string) => {
    alert(t('redirect', { store: val }));
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 overflow-hidden">
      <div className="max-w-5xl w-full text-center space-y-12">
        {/* Animated WiFi Off Icon */}
        <div className="relative mb-8">
          <div
            className={`inline-flex items-center justify-center w-32 h-32 rounded-full bg-background shadow-lg transition-all duration-1000 ${
              pulseAnimation ? 'scale-110 shadow-xl' : 'scale-100 shadow-lg'
            }`}
          >
            <WifiOff
              className={`w-16 h-16 text-primary transition-all duration-500 ${
                pulseAnimation ? 'scale-110' : 'scale-100'
              }`}
            />
          </div>
        </div>

        {/* GolfGuiders Logo */}
        <div className="flex items-center justify-center mb-8">
          <Logo />
        </div>

        {/* Main Content */}
        <div className="bg-background border-foreground/20 shadow-foreground/20 rounded-2xl shadow-lg p-8 mb-8 transform transition-all duration-300">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            {t('title')}
          </h1>

          <p className="text-lg text-gray-600 mb-6 leading-relaxed">
            {t('subtitle')}
          </p>

          {/* {previousRoute !== '/' && (
            <p className="text-sm text-gray-500 mb-4">
              We'll take you back to where you were:{' '}
              <span className="font-medium text-primary">
                {previousRoute}
              </span>
            </p>
          )} */}

          <div className="space-y-4 mb-8">
            <div className="flex items-center justify-center text-gray-500">
              <div className="w-2 h-2 bg-primary/50 rounded-full animate-bounce mr-2"></div>
              <div
                className="w-2 h-2 bg-primary/50 rounded-full animate-bounce mr-2"
                style={{ animationDelay: '0.1s' }}
              ></div>
              <div
                className="w-2 h-2 bg-primary/50 rounded-full animate-bounce"
                style={{ animationDelay: '0.2s' }}
              ></div>
            </div>
            <p className="text-sm text-gray-500">
              {isRetrying ? t('check.retry') : t('check.label')}
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={handleRetry}
              disabled={isRetrying}
              className={`inline-flex items-center px-6 py-3 rounded-full font-semibold transition-all duration-300 hover:bg-primary-tap ${
                isRetrying
                  ? 'bg-primary-tap text-gray-400 cursor-not-allowed'
                  : 'bg-primary text-white hover:brightness-60 hover:scale-105 active:scale-95'
              }`}
            >
              <RefreshCw
                className={`w-5 h-5 mr-2 ${isRetrying ? 'animate-spin' : ''}`}
              />
              {isRetrying ? t('check.loading') : t('tryBtn')}
            </button>
          </div>
        </div>

        {/* App Download Section */}
        <div className="bg-background rounded-2xl border-foreground/20 shadow-foreground/20 shadow-lg p-6 transform transition-all duration-300">
          <div className="flex items-center justify-center mb-4">
            <Smartphone className="w-8 h-8 text-primary mr-3" />
            <h2 className="text-xl font-bold text-foreground">
              {t('download.title')}
            </h2>
          </div>

          <p className="text-gray-500 mb-6">{t('download.subtitle')}</p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              target="_"
              href="https://apps.apple.com/us/app/golfguiders/id6741823893"
              onClick={() => handleDownloadApp(t('download.apple.label'))}
              className="inline-flex items-center justify-center px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary-tap hover:scale-105 active:scale-95 transition-all duration-300"
              title={t('download.apple.label')}
            >
              <div className="w-6 h-6 mr-3">
                {/* Apple Logo */}
                <svg viewBox="0 0 24 24" className="w-full h-full fill-current">
                  <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
                </svg>
              </div>
              <div className="text-left">
                <div className="text-xs">{t('download.apple.text')}</div>
                <div className="text-sm font-semibold">
                  {t('download.apple.label')}
                </div>
              </div>
            </Link>

            <Link
              href="https://play.google.com/store/apps/details?id=com.golf_mobile_app&hl=en"
              target="_"
              onClick={() => handleDownloadApp(t('download.play.label'))}
              className="inline-flex items-center justify-center px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary-tap hover:scale-105 active:scale-95 transition-all duration-300"
              title={t('download.play.label')}
            >
              <div className="w-6 h-6 mr-3">
                {/* Google Play Logo */}
                <svg viewBox="0 0 24 24" className="w-full h-full fill-current">
                  <path d="M3,20.5V3.5C3,2.91 3.34,2.39 3.84,2.15L13.69,12L3.84,21.85C3.34,21.6 3,21.09 3,20.5M16.81,15.12L6.05,21.34L14.54,12.85L16.81,15.12M20.16,10.81C20.5,11.08 20.75,11.5 20.75,12C20.75,12.5 20.53,12.9 20.18,13.18L17.89,14.5L15.39,12L17.89,9.5L20.16,10.81M6.05,2.66L16.81,8.88L14.54,11.15L6.05,2.66Z" />
                </svg>
              </div>
              <div className="text-left">
                <div className="text-xs">{t('download.play.text')}</div>
                <div className="text-sm font-semibold">
                  {t('download.play.label')}
                </div>
              </div>
            </Link>
          </div>
        </div>

        {/* Tips Section */}
        <div className="mt-8 text-center">
          <h3 className="text-lg font-semibold text-foreground mb-4">
            {t('wait.label')}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
            <div className="bg-background rounded-lg p-4 border-foreground/20 shadow-foreground/20 shadow-md hover:shadow-lg transition-shadow duration-300">
              <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-2">
                <WifiOff className="w-4 h-4 text-primary" />
              </div>
              {t('wait.tip1')}
            </div>
            <div className="bg-background rounded-lg p-4 border-foreground/20 shadow-foreground/20 shadow-md hover:shadow-lg transition-shadow duration-300">
              <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-2">
                <RefreshCw className="w-4 h-4 text-primary" />
              </div>
              {t('wait.tip2')}
            </div>
            <div className="bg-background rounded-lg p-4 border-foreground/20 shadow-foreground/20 shadow-md hover:shadow-lg transition-shadow duration-300">
              <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-2">
                <Smartphone className="w-4 h-4 text-primary" />
              </div>
              {t('wait.tip3')}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
