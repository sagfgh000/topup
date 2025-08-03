
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
import type { Order } from '@/lib/types';
import { Loader2, ArrowUpRight } from 'lucide-react';
import { Button } from './ui/button';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import OrderStatusBadge from './OrderStatusBadge';

export default function RecentOrders() {
  const { user } = useAuth();
  const [orders, setOrders] = React.useState<Order[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    setLoading(true);

    const orderQuery = query(
      collection(db, 'orders'),
      where('userId', '==', user.uid),
      orderBy('createdAt', 'desc'),
      limit(4)
    );

    const unsubscribe = onSnapshot(orderQuery, (snapshot) => {
      const fetchedOrders = snapshot.docs.map((doc) => {
        const data = doc.data();
        const createdAtDate = (data.createdAt as Timestamp)?.toDate() || new Date();
        return { ...data, id: doc.id, createdAt: createdAtDate } as Order;
      });
      setOrders(fetchedOrders);
      setLoading(false);
    }, (error) => {
        console.error("Error fetching recent orders:", error);
        setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-6">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="text-center text-muted-foreground py-6">
        <p>You haven't placed any orders yet.</p>
        <Button variant="link" asChild className="mt-2">
          <Link href="/">Place an Order</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4 pt-2">
      {orders.map((order) => (
        <div key={order.id} className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <ArrowUpRight className="h-5 w-5 text-red-500 flex-shrink-0" />
            <div>
              <p className="font-medium text-sm">{order.productName}</p>
              <p className="text-xs text-muted-foreground">
                {order.createdAt.toLocaleDateString()}
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="font-bold text-sm text-red-500">
              -৳{order.productPrice.toFixed(2)}
            </p>
            <OrderStatusBadge status={order.status} />
          </div>
        </div>
      ))}
    </div>
  );
}
