import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui';
import { cn, getInitials, getName } from '@/lib/utils';

export default function AvatarBox({
  name,
  src,
  className,
  fallback,
}: {
  name: string;
  src: string;
  className?: string;
  fallback?: string;
}) {
  return (
    <Avatar className={cn('size-12 border relative', className)}>
      <AvatarImage src={src || '...'} alt={getName(name)} />
      <AvatarFallback className={cn('text-[90%] text-foreground', fallback)}>
        {getInitials(name)}
      </AvatarFallback>
    </Avatar>
  );
}
