import { Logo } from '@/components/common';

export default function AppLoading() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-background">
      <Logo className="h-10 text-primary animate-pulse" />
      <div className="flex gap-1">
        <span className="w-2 h-2 rounded-full bg-primary/60 animate-bounce [animation-delay:-0.3s]" />
        <span className="w-2 h-2 rounded-full bg-primary/60 animate-bounce [animation-delay:-0.15s]" />
        <span className="w-2 h-2 rounded-full bg-primary/60 animate-bounce" />
      </div>
    </div>
  );
}
