import type { ClassValue } from "clsx";
import { cn } from "~/lib/utils";

export function Money({ value, symbol, label, className }: { value: number, symbol: string, label?: string, className?: ClassValue }) {
  return (
    <p
      className={cn(
        'text-sm break-words',
        {
          'text-emerald-600 dark:text-emerald-400': value > 0,
          'text-rose-600 dark:text-rose-400': value < 0,
          'text-gray-500': value === 0,
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
