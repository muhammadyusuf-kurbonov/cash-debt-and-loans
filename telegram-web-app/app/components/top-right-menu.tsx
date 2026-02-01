import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './ui/dropdown-menu'
import { Button } from './ui/button'
import { MoreVertical, User, LogOut } from 'lucide-react'
import { useNavigate } from 'react-router';
import { TOKEN_STORAGE_KEY } from '~/lib/telegram-auth';

export function TopRightMenu({
  openCurrencyList,
  dropdownOpen,
  onDropdownOpenChange,
}: {
  openCurrencyList: () => void,
  dropdownOpen: boolean,
  onDropdownOpenChange: (isOpen: boolean) => void,
}) {
  const navigate = useNavigate();

  const handleProfileClick = () => {
    navigate('/profile');
  };

  const handleLogout = () => {
    // Clear authentication token
    sessionStorage.removeItem(TOKEN_STORAGE_KEY);
    
    // Redirect to welcome page
    navigate('/');
  };

  return (
    <DropdownMenu open={dropdownOpen} onOpenChange={onDropdownOpenChange}>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon">
          <MoreVertical className="h-5 w-5" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuItem onClick={handleProfileClick} className="flex items-center">
          <User className="mr-2 h-4 w-4" />
          <span>Profile</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={openCurrencyList} className="flex items-center">
          💲 Currencies
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleLogout} className="flex items-center text-red-600">
          <LogOut className="mr-2 h-4 w-4" />
          <span>Logout</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}