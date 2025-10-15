import { cn } from "~/lib/utils";

export function StickyFooter({ children, className }: { children: React.ReactNode, className?: string }) {
  return (
    <div className={cn('sticky bottom-0 bg-white border-t p-4 shadow-sm flex justify-between text-sm', className)}>
      <div className="max-w-2xl w-full">
        {children}
      </div>
    </div>
  )
}