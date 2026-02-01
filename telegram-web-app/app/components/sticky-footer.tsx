import { cn } from "~/lib/utils";

export function StickyFooter({ children, className }: { children: React.ReactNode, className?: string }) {
  return (
    <div
      className={cn(
        'sticky bottom-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-t border-gray-200 dark:border-gray-800 p-4 shadow-sm flex justify-between text-sm',
        className
      )}
      style={{ paddingBottom: 'max(1rem, env(safe-area-inset-bottom))' }}
    >
      <div className="max-w-2xl w-full">
        {children}
      </div>
    </div>
  )
}
