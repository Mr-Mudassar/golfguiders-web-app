'use client';

import React from 'react';
import { Button, Card, CardContent, Icon, AnimatedCard } from '@/components/ui';
import { cn } from '@/lib/utils';
import { useLocale, useTranslations } from 'next-intl';
import dynamic from 'next/dynamic';

const InviteDialog = dynamic(
  () => import('./invite-dialog').then((mod) => mod.InviteDialog),
  { ssr: false }
);

interface InviteFriendsProps {
  readonly className?: string;
}

const InviteFriends: React.FC<InviteFriendsProps> = ({ className }) => {
  const t = useTranslations('homePage.invite');
  const locale = useLocale();
  return (
    <AnimatedCard index={2}>
      <Card
        onMouseEnter={() => import('./invite-dialog')}
        className={cn('relative overflow-hidden group border border-primary/20 bg-gradient-to-br from-primary/5 via-card to-primary/10', className)}
      >
        <div className="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 bg-primary/10 rounded-full blur-2xl group-hover:bg-primary/20 transition-all duration-500" />

        <CardContent className="flex flex-col items-center p-6 text-center relative z-10">
          <div className="flex items-center justify-center bg-primary/15 backdrop-blur-md rounded-2xl p-4 shadow-inner mb-4 transition-transform duration-300 group-hover:scale-110">
            <Icon name="user-plus" size={22} className="text-primary" />
          </div>

          <h3 className="font-bold text-lg text-foreground tracking-tight">
            {t('label', { locale })}
          </h3>

          <p className="text-muted-foreground text-xs mt-2 leading-relaxed max-w-[200px]">
            {t('description', { locale })}
          </p>

          <InviteDialog
            trigger={
              <Button
                variant="outline"
                className="mt-6 w-full h-10 rounded-xl border-border/50 bg-muted/30 text-muted-foreground hover:text-primary hover:bg-primary/5 hover:border-primary/30 font-medium transition-all"
              >
                {t('btn', { locale })}
              </Button>
            }
          />
        </CardContent>
      </Card>
    </AnimatedCard>
  );
};

export { InviteFriends };
