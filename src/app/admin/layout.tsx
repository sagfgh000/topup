'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  Gem,
  LayoutDashboard,
  Package,
  PanelLeft,
  Settings,
  LogOut,
  Users,
  CircleDollarSign,
} from 'lucide-react';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useAuth } from '@/contexts/AuthContext';

const navItems = [
  { href: '/admin/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/admin/topups', icon: CircleDollarSign, label: 'Top-Ups' },
  { href: '/admin/products', icon: Package, label: 'Products' },
  { href: '/admin/customers', icon: Users, label: 'Customers' },
  { href: '/admin/settings', icon: Settings, label: 'Settings' },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, loading, logout } = useAuth();
  
  // This should be a state that is managed after login, but for simplicity, we check directly.
  const [isAdmin, setIsAdmin] = React.useState(false);
  const [isAuthChecked, setIsAuthChecked] = React.useState(false);


  React.useEffect(() => {
    if (loading) return;

    if (!user) {
      router.push('/admin/login');
      return;
    }

    // This is a basic client-side check. A more robust solution would involve custom claims on the Firebase user token.
    const checkAdminStatus = user.email === 'kymt83091@gmail.com';
    setIsAdmin(checkAdminStatus);
    
    if (!checkAdminStatus) {
      router.push('/dashboard');
    }
    setIsAuthChecked(true);

  }, [user, loading, router]);


  if (loading || !isAuthChecked || !isAdmin) {
      return <div className="flex h-screen items-center justify-center">Loading admin panel...</div>
  }

  const handleLogout = async () => {
    await logout();
    router.push('/admin/login');
  }

  const sidebarNav = (
    <nav className="grid gap-2 text-lg font-medium">
      {navItems.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={cn(
            'flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary',
            pathname === item.href && 'bg-muted text-primary'
          )}
        >
          <item.icon className="h-4 w-4" />
          {item.label}
        </Link>
      ))}
    </nav>
  );

  const tooltipNav = (
    <TooltipProvider>
      <aside className="fixed inset-y-0 left-0 z-10 hidden w-14 flex-col border-r bg-background sm:flex">
        <nav className="flex flex-col items-center gap-4 px-2 sm:py-5">
          <Link
            href="/"
            className="group flex h-9 w-9 shrink-0 items-center justify-center gap-2 rounded-full bg-primary text-lg font-semibold text-primary-foreground md:h-8 md:w-8 md:text-base"
          >
            <Gem className="h-4 w-4 transition-all group-hover:scale-110" />
            <span className="sr-only">Diamond Depot</span>
          </Link>
          {navItems.map((item) => (
            <Tooltip key={item.href}>
              <TooltipTrigger asChild>
                <Link
                  href={item.href}
                  className={cn(
                    'flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:text-foreground md:h-8 md:w-8',
                    pathname.startsWith(item.href) && 'bg-accent text-accent-foreground'
                  )}
                >
                  <item.icon className="h-5 w-5" />
                  <span className="sr-only">{item.label}</span>
                </Link>
              </TooltipTrigger>
              <TooltipContent side="right">{item.label}</TooltipContent>
            </Tooltip>
          ))}
        </nav>
        <nav className="mt-auto flex flex-col items-center gap-4 px-2 sm:py-5">
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={handleLogout}
                className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:text-foreground md:h-8 md:w-8"
              >
                <LogOut className="h-5 w-5" />
                <span className="sr-only">Logout</span>
              </button>
            </TooltipTrigger>
            <TooltipContent side="right">Logout</TooltipContent>
          </Tooltip>
        </nav>
      </aside>
    </TooltipProvider>
  );

  return (
    <div className="flex min-h-screen w-full flex-col bg-muted/40">
      {tooltipNav}
      <div className="flex flex-col sm:gap-4 sm:py-4 sm:pl-14">
        <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
          <Sheet>
            <SheetTrigger asChild>
              <Button size="icon" variant="outline" className="sm:hidden">
                <PanelLeft className="h-5 w-5" />
                <span className="sr-only">Toggle Menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="sm:max-w-xs">
              <nav className="grid gap-6 text-lg font-medium">
                <Link
                  href="/"
                  className="group flex h-10 w-10 shrink-0 items-center justify-center gap-2 rounded-full bg-primary text-lg font-semibold text-primary-foreground md:text-base"
                >
                  <Gem className="h-5 w-5 transition-all group-hover:scale-110" />
                  <span className="sr-only">Diamond Depot</span>
                </Link>
                {navItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                        'flex items-center gap-4 px-2.5 text-muted-foreground hover:text-foreground',
                        pathname === item.href && 'text-foreground'
                    )}
                  >
                    <item.icon className="h-5 w-5" />
                    {item.label}
                  </Link>
                ))}
                 <button onClick={handleLogout} className="flex items-center gap-4 px-2.5 text-muted-foreground hover:text-foreground">
                    <LogOut className="h-5 w-5" />
                    Logout
                 </button>
              </nav>
            </SheetContent>
          </Sheet>
          <div className="font-headline text-xl">
            {navItems.find(item => pathname.startsWith(item.href))?.label || 'Admin'}
          </div>
        </header>
        <main className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
          {children}
        </main>
      </div>
    </div>
  );
}
