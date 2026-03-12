'use client';
import { useRouter } from 'next/navigation';
import React, { useState, useEffect } from 'react';
import { Button } from '../ui';
import { useTranslations } from 'next-intl';
import { WifiOff, RefreshCw } from 'lucide-react';

export default function NoInternetDialog() {
  const [isOffline, setIsOffline] = useState(false);
  const [isRetrying, setIsRetrying] = useState(false);
  const router = useRouter();
  const t = useTranslations('noInternetPage');

  useEffect(() => {
    const updateStatus = () => setIsOffline(!navigator.onLine);
    updateStatus();

    window.addEventListener('online', updateStatus);
    window.addEventListener('offline', updateStatus);
    return () => {
      window.removeEventListener('online', updateStatus);
      window.removeEventListener('offline', updateStatus);
    };
  }, []);

  const handleRetry = async () => {
    setIsRetrying(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    
    if (!navigator.onLine) {
      router.push('/no-internet');
      setIsOffline(false);
    } else {
      setIsOffline(false);
    }
    setIsRetrying(false);
  };

  React.useEffect(() => {
    if (typeof window !== 'undefined' && window.location.href.includes('no-internet')) {
      setIsOffline(false);
    }
  }, []);

  if (!isOffline) return null;

  return (
    <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-background border border-foreground/10 p-8 rounded-2xl shadow-2xl max-w-sm w-full text-center animate-in fade-in zoom-in duration-300">
        <div className="mb-6 flex justify-center">
          <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center animate-pulse">
            <WifiOff className="w-10 h-10 text-primary" />
          </div>
        </div>
        
        <h2 className="text-2xl font-bold text-foreground mb-3 leading-tight">
          {t('title')}
        </h2>
        
        <p className="text-muted-foreground mb-8 text-sm leading-relaxed px-2">
          {t('subtitle')}
        </p>
        
        <Button 
          onClick={handleRetry} 
          disabled={isRetrying}
          className="w-full py-6 text-base font-semibold rounded-xl transition-all active:scale-95 shadow-lg shadow-primary/20"
        >
          {isRetrying ? (
            <RefreshCw className="w-5 h-5 animate-spin mr-2" />
          ) : null}
          {isRetrying ? t('check.loading') : t('tryBtn')}
        </Button>
      </div>
    </div>
  );
}
