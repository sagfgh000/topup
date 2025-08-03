
'use client';

import * as React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { db } from '@/lib/firebase';
import {
  collection,
  query,
  where,
  onSnapshot,
  orderBy,
  limit,
  Timestamp,
} from 'firebase/firestore';
import type { Order, TopUpRequest } from '@/lib/types';
import { Loader2, ArrowUpRight, ArrowDownLeft } from 'lucide-react';
import { Button } from './ui/button';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import OrderStatusBadge from './OrderStatusBadge';


type CombinedTransaction = (
  | ({ type: 'Order' } & Order)
  | ({ type: 'TopUp' } & TopUpRequest)
) & { date: Date };


export default function RecentTransactions() {
  const { user } = useAuth();
  const [transactions, setTransactions] = React.useState<CombinedTransaction[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    setLoading(true);

    const topUpQuery = query(
      collection(db, 'topUpRequests'),
      where('userId', '==', user.uid),
      where('status', '==', 'Approved'),
      orderBy('createdAt', 'desc'),
      limit(3)
    );

    const orderQuery = query(
      collection(db, 'orders'),
      where('userId', '==', user.uid),
      orderBy('createdAt', 'desc'),
      limit(3)
    );
    
    let orders: Order[] = [];
    let topUps: TopUpRequest[] = [];
    let combinedLoaded = { orders: false, topups: false };


    const combineAndSetTransactions = () => {
        if (!combinedLoaded.orders || !combinedLoaded.topups) return;

        const combined = [
            ...topUps.map(t => ({ ...t, type: 'TopUp' as const, date: t.createdAt, id: t.id || t.transactionId })),
            ...orders.map(o => ({ ...o, type: 'Order' as const, date: o.createdAt }))
        ];
        
        combined.sort((a, b) => b.date.getTime() - a.date.getTime());
        setTransactions(combined.slice(0, 4)); // Get the 4 most recent transactions overall
        setLoading(false);
    };

    const unsubscribeTopUps = onSnapshot(topUpQuery, (snapshot) => {
        topUps = snapshot.docs.map(doc => {
            const data = doc.data();
            const createdAtDate = (data.createdAt as Timestamp)?.toDate() || new Date();
            return { ...data, id: doc.id, createdAt: createdAtDate } as TopUpRequest;
        });
        combinedLoaded.topups = true;
        combineAndSetTransactions();
    }, (error) => {
      console.error("Error fetching top-ups:", error);
      combinedLoaded.topups = true;
      combineAndSetTransactions();
    });

    const unsubscribeOrders = onSnapshot(orderQuery, (snapshot) => {
        orders = snapshot.docs.map(doc => {
            const data = doc.data();
            const createdAtDate = (data.createdAt as Timestamp)?.toDate() || new Date();
            return { ...data, id: doc.id, createdAt: createdAtDate } as Order;
        });
        combinedLoaded.orders = true;
        combineAndSetTransactions();
    }, (error) => {
      console.error("Error fetching orders:", error);
      combinedLoaded.orders = true;
      combineAndSetTransactions();
    });

    return () => {
        unsubscribeTopUps();
        unsubscribeOrders();
    };

  }, [user]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-6">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  if (transactions.length === 0) {
    return (
      <div className="text-center text-muted-foreground py-6">
        <p>You haven't made any transactions yet.</p>
        <Button variant="link" asChild className="mt-2">
          <Link href="/">Place an Order</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4 pt-2">
      {transactions.map((tx) => (
        <div key={`${tx.type}-${tx.id}`} className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
             {tx.type === 'TopUp' ? (
                 <ArrowDownLeft className="h-5 w-5 text-green-500 flex-shrink-0" />
             ) : (
                <ArrowUpRight className="h-5 w-5 text-red-500 flex-shrink-0" />
             )}
            <div>
                <p className="font-medium text-sm">
                    {tx.type === 'TopUp' ? 'Wallet Top-up' : tx.productName}
                </p>
                <p className="text-xs text-muted-foreground">
                    {tx.date.toLocaleDateString()}
                </p>
            </div>
          </div>
          <div className="text-right">
             <p className={cn(
                "font-bold text-sm",
                 tx.type === 'TopUp' ? 'text-green-500' : 'text-red-500'
              )}>
                {tx.type === 'TopUp' ? '+' : '-'}৳{tx.type === 'TopUp' ? tx.amount.toFixed(2) : tx.productPrice.toFixed(2)}
              </p>
              <OrderStatusBadge status={tx.status} />
          </div>
        </div>
      ))}
    </div>
  );
}
