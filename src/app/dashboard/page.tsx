
'use client';

import * as React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import Header from '@/components/Header';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { DollarSign, Gem, History, LogOut, Loader2, ListCollapse } from 'lucide-react';
import Link from 'next/link';
import { db } from '@/lib/firebase';
import { doc, onSnapshot, setDoc } from 'firebase/firestore';
import type { Wallet } from '@/lib/types';
import { AddMoneyDialog } from '@/components/AddMoneyDialog';
import RecentTransactions from '@/components/RecentTransactions';
import { AgreementDialog } from '@/components/AgreementDialog';

export default function DashboardPage() {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [walletLoading, setWalletLoading] = useState(true);
  const [isAddMoneyOpen, setIsAddMoneyOpen] = useState(false);
  const [showAgreement, setShowAgreement] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);
  
  useEffect(() => {
    if (user) {
      const walletRef = doc(db, 'wallets', user.uid);
      const unsubscribe = onSnapshot(walletRef, (docSnap) => {
        if (docSnap.exists()) {
          const walletData = docSnap.data() as Wallet;
          setWallet(walletData);
          if (!walletData.hasAcceptedAgreement) {
              setShowAgreement(true);
          }
        } else {
          // If wallet doesn't exist, it means user is new or hasn't topped up.
          // They also won't have accepted the agreement.
          setWallet({ balance: 0, hasAcceptedAgreement: false });
          setShowAgreement(true);
        }
        setWalletLoading(false);
      });
      return () => unsubscribe();
    }
  }, [user]);

  const handleAgree = async () => {
    if (user) {
        const walletRef = doc(db, 'wallets', user.uid);
        try {
            await setDoc(walletRef, { hasAcceptedAgreement: true, balance: 0 }, { merge: true });
            setShowAgreement(false);
        } catch (e) {
            console.error("Failed to save agreement", e);
        }
    }
  }


  if (loading || !user || walletLoading) {
    return (
        <div className="flex items-center justify-center min-h-screen">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
    );
  }

  if (showAgreement) {
      return <AgreementDialog onAgree={handleAgree} onLogout={logout} />;
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
                    {walletLoading ? (
                        <div className="flex items-center justify-center pt-4">
                            <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        </div>
                    ) : (
                       <>
                         <div className="text-4xl font-bold">৳{(wallet?.balance || 0).toFixed(2)}</div>
                         <p className="text-xs text-muted-foreground mt-1">
                             Available to spend on orders.
                         </p>
                       </>
                    )}
                    <Button className="mt-4" size="sm" onClick={() => setIsAddMoneyOpen(true)}>Add Money</Button>
                </CardContent>
            </Card>

             <Card className="shadow-lg">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Recent Transactions</CardTitle>
                    <Gem className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                   <RecentTransactions />
                </CardContent>
            </Card>

             <Card className="shadow-lg">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Account Actions</CardTitle>
                    <History className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent className="grid gap-2 pt-4">
                    <Button variant="outline" asChild><Link href="/orders">Order History</Link></Button>
                    <Button variant="outline" asChild><Link href="/transactions"><ListCollapse className="mr-2 h-4 w-4" />Transaction History</Link></Button>
                    <Button variant="destructive" onClick={logout}><LogOut className="mr-2 h-4 w-4"/>Logout</Button>
                </CardContent>
            </Card>
        </div>
      </main>
      <AddMoneyDialog isOpen={isAddMoneyOpen} onOpenChange={setIsAddMoneyOpen} />
    </>
  );
}
