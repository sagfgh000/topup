'use client';

import { useAuth } from '@/contexts/AuthContext';
import Header from '@/components/Header';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { DollarSign, Gem, History, LogOut } from 'lucide-react';
import Link from 'next/link';

export default function DashboardPage() {
  const { user, loading, logout } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  if (loading || !user) {
    return (
        <div className="flex items-center justify-center min-h-screen">
            <div className="text-lg">Loading...</div>
        </div>
    );
  }

  return (
    <>
      <Header />
      <main className="container mx-auto px-4 py-8 md:py-12">
        <div className="space-y-4 mb-8">
            <h1 className="text-3xl font-bold font-headline">Welcome, {user.email}!</h1>
            <p className="text-muted-foreground">Here's an overview of your account.</p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
             <Card className="shadow-lg">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Wallet Balance</CardTitle>
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-4xl font-bold">৳0.00</div>
                    <p className="text-xs text-muted-foreground mt-1">
                        You have no funds. Top up to place an order.
                    </p>
                    <Button className="mt-4" size="sm">Add Money</Button>
                </CardContent>
            </Card>

             <Card className="shadow-lg">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Recent Orders</CardTitle>
                    <Gem className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                   <div className="text-center text-muted-foreground py-6">
                       <p>You haven't placed any orders yet.</p>
                       <Button variant="link" asChild className="mt-2"><Link href="/">Place an Order</Link></Button>
                   </div>
                </CardContent>
            </Card>

             <Card className="shadow-lg">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Account Actions</CardTitle>
                    <History className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent className="grid gap-2 pt-4">
                    <Button variant="outline" asChild><Link href="/orders">Order History</Link></Button>
                    <Button variant="outline">Transaction History</Button>
                    <Button variant="destructive" onClick={logout}><LogOut className="mr-2 h-4 w-4"/>Logout</Button>
                </CardContent>
            </Card>
        </div>
      </main>
    </>
  );
}
