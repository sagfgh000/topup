'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Gem } from 'lucide-react';

export default function Header() {
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
              <li>
                <Button variant="ghost" asChild>
                  <Link href="/orders">Track Order</Link>
                </Button>
              </li>
              <li>
                <Button asChild>
                  <Link href="/admin/dashboard">Admin Panel</Link>
                </Button>
              </li>
            </ul>
          </nav>
        </div>
      </div>
    </header>
  );
}
