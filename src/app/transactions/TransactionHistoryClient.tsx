'use client';

import * as React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { db } from '@/lib/firebase';
import {
  collection,
  query,
  where,
  getDocs,
  orderBy,
  Timestamp,
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

    const fetchTransactions = async () => {
      setLoading(true);
      try {
        // Fetch approved top-ups
        const topUpQuery = query(
          collection(db, 'topUpRequests'),
          where('userId', '==', user.uid),
          where('status', '==', 'Approved'),
          orderBy('createdAt', 'desc')
        );
        const topUpSnapshot = await getDocs(topUpQuery);
        const topUps = topUpSnapshot.docs.map(doc => {
            const data = doc.data() as TopUpRequest;
            return {
                ...data,
                id: doc.id,
                type: 'TopUp' as const,
                date: (data.createdAt as Timestamp).toDate(),
            }
        });

        // Fetch completed orders
        const orderQuery = query(
          collection(db, 'orders'),
          where('userId', '==', user.uid),
          // We can add a filter for status if we only want to show completed orders
          // where('status', '==', 'Completed'), 
          orderBy('createdAt', 'desc')
        );
        const orderSnapshot = await getDocs(orderQuery);
        const orders = orderSnapshot.docs.map(doc => {
            const data = doc.data() as Order;
            return {
                ...data,
                id: doc.id,
                type: 'Order' as const,
                date: (data.createdAt as Timestamp).toDate(),
            }
        });

        // Combine and sort
        const combined: CombinedTransaction[] = [...topUps, ...orders];
        combined.sort((a, b) => b.date.getTime() - a.date.getTime());
        setTransactions(combined);

      } catch (error) {
        console.error('Error fetching transactions:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();
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
            <TableHead className="text-right">Amount</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {transactions.map((tx) => (
            <TableRow key={`${tx.type}-${tx.id}`}>
              <TableCell>
                {tx.type === 'TopUp' ? (
                  <Badge variant="secondary" className="bg-green-100 text-green-800 border-green-200">
                    <ArrowDownLeft className="mr-1 h-3 w-3" />
                    Top-Up
                  </Badge>
                ) : (
                  <Badge variant="secondary" className="bg-red-100 text-red-800 border-red-200">
                    <ArrowUpRight className="mr-1 h-3 w-3" />
                    Order
                  </Badge>
                )}
              </TableCell>
              <TableCell className="font-medium">
                {tx.type === 'TopUp' ? `Wallet top-up via ${tx.paymentMethod}` : `Order for ${tx.productName}`}
              </TableCell>
              <TableCell>{tx.date.toLocaleString()}</TableCell>
              <TableCell className={cn(
                "text-right font-bold",
                 tx.type === 'TopUp' ? 'text-green-600' : 'text-red-600'
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
