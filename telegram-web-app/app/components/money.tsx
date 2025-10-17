import type { ClassValue } from "clsx";
import { cn } from "~/lib/utils";

export function Money({ value, symbol, label, className }: { value: number, symbol: string, label?: string, className?: ClassValue }) {
  return (
    <p
      className={cn(
        'text-sm',
        {
          'text-green-600': value > 0,
          'text-red-600': value < 0,
          'text-gray-600': value === 0,
        },
        className,
      )}
    >
      {label ?? ''} {value.toLocaleString('ru', {
        maximumFractionDigits: 2,
        signDisplay: 'always',
        useGrouping: true,
      })} {symbol}
    </p>
  );
}