
'use client';

import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Gem, LogOut, User as UserIcon, LayoutDashboard, Phone } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from './ui/skeleton';

export default function Header() {
  const { user, loading, logout } = useAuth();
  const isAdmin = user?.email === 'kymt83091@gmail.com';

  const getInitials = (email: string | null | undefined) => {
    if (!email) return 'U';
    return email.substring(0, 2).toUpperCase();
  }

  return (
    <header className="bg-card/80 backdrop-blur-sm sticky top-0 z-50 border-b">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="flex items-center gap-2">
            <Gem className="h-6 w-6 text-primary" />
            <span className="font-bold text-lg font-headline">Diamond Depot</span>
          </Link>
          <nav>
            <ul className="flex items-center gap-4">
              {loading ? (
                <Skeleton className="h-10 w-20" />
              ) : user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                       <Avatar className="h-9 w-9">
                          <AvatarImage src={user.photoURL || ''} alt={user.displayName || 'User'} />
                          <AvatarFallback>{getInitials(user.email)}</AvatarFallback>
                        </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56" align="end" forceMount>
                    <DropdownMenuLabel className="font-normal">
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">My Account</p>
                        <p className="text-xs leading-none text-muted-foreground">
                          {user.email}
                        </p>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                       <Link href="/dashboard"><LayoutDashboard className="mr-2 h-4 w-4" />Dashboard</Link>
                    </DropdownMenuItem>
                    {isAdmin && (
                        <DropdownMenuItem asChild>
                        <Link href="/admin/dashboard"><UserIcon className="mr-2 h-4 w-4" />Admin</Link>
                        </DropdownMenuItem>
                    )}
                    <DropdownMenuItem asChild>
                       <Link href="/contact"><Phone className="mr-2 h-4 w-4" />Contact Us</Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={logout}>
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Log out</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                 <>
                    <li>
                      <Button variant="ghost" asChild>
                        <Link href="/login">Login</Link>
                      </Button>
                    </li>
                    <li>
                      <Button asChild>
                        <Link href="/signup">Sign Up</Link>
                      </Button>
                    </li>
                 </>
              )}
            </ul>
          </nav>
        </div>
      </div>
    </header>
  );
}
