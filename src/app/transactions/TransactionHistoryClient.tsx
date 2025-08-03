
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
  Timestamp,
  limit,
} from 'firebase/firestore';
import type { Order, TopUpRequest } from '@/lib/types';
import { Loader2, ArrowDownLeft, ArrowUpRight } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';
import OrderStatusBadge from '@/components/OrderStatusBadge';

type CombinedTransaction = (
  | ({ type: 'Order' } & Order)
  | ({ type: 'TopUp' } & TopUpRequest)
) & { date: Date };


export default function TransactionHistoryClient() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [transactions, setTransactions] = React.useState<CombinedTransaction[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    if (authLoading) return;
    if (!user) {
        router.push('/login');
        return;
    }

    setLoading(true);

    const topUpQuery = query(
      collection(db, 'topUpRequests'),
      where('userId', '==', user.uid),
      orderBy('createdAt', 'desc'),
      limit(50)
    );

    const orderQuery = query(
      collection(db, 'orders'),
      where('userId', '==', user.uid),
      orderBy('createdAt', 'desc'),
      limit(50)
    );
    
    let orders: Order[] = [];
    let topUps: TopUpRequest[] = [];
    let combinedLoaded = { orders: false, topups: false };


    const combineAndSetTransactions = () => {
        // Only combine and set state if both listeners have returned data
        if (!combinedLoaded.orders || !combinedLoaded.topups) return;

        const combined = [
            ...topUps.map(t => ({ ...t, type: 'TopUp' as const, date: t.createdAt, id: t.id || t.transactionId })),
            ...orders.map(o => ({ ...o, type: 'Order' as const, date: o.createdAt }))
        ];
        combined.sort((a, b) => b.date.getTime() - a.date.getTime());
        setTransactions(combined);
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
        console.error('Error fetching topups:', error);
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
        console.error('Error fetching orders:', error);
        combinedLoaded.orders = true;
        combineAndSetTransactions();
    });

    return () => {
        unsubscribeTopUps();
        unsubscribeOrders();
    };

  }, [user, authLoading, router]);

  if (loading || authLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (transactions.length === 0) {
    return (
        <Alert>
            <AlertTitle>No Transactions Found</AlertTitle>
            <AlertDescription>You have not made any transactions yet.</AlertDescription>
        </Alert>
    );
  }

  return (
    <div className="border rounded-lg overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Type</TableHead>
            <TableHead>Description</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Amount</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {transactions.map((tx) => (
            <TableRow key={`${tx.type}-${tx.id}`} className={cn(tx.type === 'TopUp' && tx.status === 'Pending' && 'opacity-60')}>
              <TableCell>
                {tx.type === 'TopUp' ? (
                  <Badge variant="secondary" className="bg-green-100 text-green-800 border-green-200 dark:bg-green-900/50 dark:text-green-300 dark:border-green-700">
                    <ArrowDownLeft className="mr-1 h-3 w-3" />
                    Top-Up
                  </Badge>
                ) : (
                  <Badge variant="secondary" className="bg-red-100 text-red-800 border-red-200 dark:bg-red-900/50 dark:text-red-300 dark:border-red-700">
                    <ArrowUpRight className="mr-1 h-3 w-3" />
                    Order
                  </Badge>
                )}
              </TableCell>
              <TableCell className="font-medium">
                {tx.type === 'TopUp' ? `Wallet top-up via ${tx.paymentMethod}` : `Order for ${tx.productName}`}
                {tx.type === 'Order' && tx.status === 'Failed' && <span className="text-xs text-muted-foreground ml-2">(Refunded)</span>}
              </TableCell>
              <TableCell>{tx.date.toLocaleString()}</TableCell>
               <TableCell>
                 <OrderStatusBadge status={tx.status} />
               </TableCell>
              <TableCell className={cn(
                "text-right font-bold",
                 tx.type === 'TopUp' && tx.status === 'Approved' ? 'text-green-600' : 
                 tx.type === 'Order' && tx.status === 'Completed' ? 'text-red-600' : 'text-muted-foreground'
              )}>
                {tx.type === 'TopUp' ? '+' : '-'}৳{tx.type === 'TopUp' ? tx.amount.toFixed(2) : tx.productPrice.toFixed(2)}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
