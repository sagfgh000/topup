'use client';

import { Gem } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function AdminLoginPage() {
  const router = useRouter();

  const handleLogin = (event: React.FormEvent) => {
    event.preventDefault();
    // In a real app, you'd have authentication logic here.
    // For this example, we'll just redirect to the dashboard.
    router.push('/admin/dashboard');
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-muted/40">
      <Card className="w-full max-w-sm shadow-2xl">
        <CardHeader className="text-center">
          <div className="flex justify-center items-center gap-2 mb-4">
             <Gem className="h-8 w-8 text-primary" />
             <CardTitle className="font-headline text-3xl">Diamond Depot</CardTitle>
          </div>
          <CardDescription>Admin Panel Login</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="admin@example.com" required defaultValue="admin@example.com" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" required defaultValue="password" />
            </div>
            <Button type="submit" className="w-full mt-2">
              Sign In
            </Button>
          </form>
          <div className="mt-4 text-center text-sm">
            <Link href="/" className="underline text-muted-foreground hover:text-primary">
              Back to main site
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
