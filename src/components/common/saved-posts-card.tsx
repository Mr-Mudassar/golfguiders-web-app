import React from 'react';

import { Button, Card, CardContent, Icon, AnimatedCard } from '@/components/ui';
import { cn } from '@/lib/utils';
import { Link } from '@/i18n/routing';

interface SavedPostsCardProps {
  readonly className?: string;
}

const SavedPostsCard: React.FC<SavedPostsCardProps> = ({ className }) => {
  return (
    <AnimatedCard index={1}>
      <Card className={cn('bg-card/50 backdrop-blur-sm relative overflow-hidden group', className)}>
        {/* Decorative background element */}
        <div className="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 bg-primary/10 rounded-full blur-2xl group-hover:bg-primary/20 transition-all duration-500" />

        <CardContent className="flex flex-col items-center p-6 text-center relative z-10">
          <div className="flex items-center justify-center bg-primary/10 backdrop-blur-md rounded-2xl p-4 shadow-inner mb-4 transition-transform duration-300 group-hover:scale-110">
            <Icon name="bookmark" size={22} className="text-primary" />
          </div>

          {/* <h3 className="font-bold text-xl text-foreground tracking-tight">
          Saved Posts
        </h3> */}

          {/* <p className="text-muted-foreground text-sm mt-3 leading-relaxed max-w-[200px]">
          View all your saved posts in one place
        </p> */}

          <Button
            variant="outline"
            className="w-full h-10 rounded-xl border-border/50 bg-muted/30 text-muted-foreground hover:text-primary hover:bg-primary/5 hover:border-primary/30 font-medium transition-all"
            asChild
          >
            <Link href="/dashboard/posts/saved" prefetch>
              View Saved Posts
            </Link>
          </Button>
        </CardContent>
      </Card>
    </AnimatedCard>
  );
};

export { SavedPostsCard };
