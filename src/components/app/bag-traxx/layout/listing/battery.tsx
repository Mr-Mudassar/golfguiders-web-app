import { Icon } from '@/components/ui';

export const BatteryIcon = ({ percentage }: { percentage: number }) => {
  const getColor = () => {
    if (!percentage) return { text: '', bg: 'bg-gray-400 animate-pulse' };
    if (percentage >= 65) return { text: 'text-white', bg: 'bg-primary' };
    if (percentage >= 30) return { text: 'text-white', bg: 'bg-[#F59E0B]' };
    return { text: 'text-muted-foreground', bg: 'bg-red-500' };
  };

  return (
    <div className="flex items-center gap-1 mr-2">
      <div className="relative w-8 h-5 border border-gray-400 rounded-sm overflow-hidden">
        <div
          className={`h-full ${getColor().bg}`}
          style={{ width: `${percentage ?? 100}%` }}
        />
        <span
          className={`absolute inset-0 flex items-center justify-center text-[10px] font-semibold font-mono ${getColor()?.text}`}
        >
          {percentage?.toFixed(0) === 'NaN' ? (
            <Icon name="load" className="size-3 animate-spin duration-1000" />
          ) : (
            `${percentage?.toFixed(0)}%`
          )}
        </span>
      </div>
      <div className="w-1 h-3 -ml-1.5 bg-gray-400 rounded-sm" />
    </div>
  );
};
