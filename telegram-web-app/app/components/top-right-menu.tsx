import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './ui/dropdown-menu'
import { Button } from './ui/button'
import { MoreVertical } from 'lucide-react'

export function TopRightMenu({
  openCurrencyList,
  dropdownOpen,
  onDropdownOpenChange,
}: {
  openCurrencyList: () => void,
  dropdownOpen: boolean,
  onDropdownOpenChange: (isOpen: boolean) => void,
}) {
  return (
    <DropdownMenu open={dropdownOpen} onOpenChange={onDropdownOpenChange}>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon">
          <MoreVertical className="h-5 w-5" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-40">
        <DropdownMenuItem onClick={openCurrencyList}>
          💲 Currencies
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}