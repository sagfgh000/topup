'use client';

import * as React from 'react';
import {
  MoreHorizontal,
  File,
  ListFilter,
  Loader2,
} from 'lucide-react';
import { db } from '@/lib/firebase';
import { collection, onSnapshot, query, orderBy, doc, updateDoc, Timestamp, runTransaction, limit } from 'firebase/firestore';

import type { Order, Wallet } from '@/lib/types';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
} from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import OrderStatusBadge from './OrderStatusBadge';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';

export default function AdminOrdersTable() {
  const [orders, setOrders] = React.useState<Order[]>([]);
  const [loading, setLoading] = React.useState(true);
  const { toast } = useToast();

  React.useEffect(() => {
    const q = query(collection(db, 'orders'), orderBy('createdAt', 'desc'), limit(50));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const ordersData: Order[] = [];
        querySnapshot.forEach((doc) => {
            const data = doc.data();
            ordersData.push({ 
                id: doc.id,
                ...data,
                createdAt: (data.createdAt as Timestamp).toDate(),
            } as Order);
        });
        setOrders(ordersData);
        setLoading(false);
    }, (error) => {
        console.error("Error fetching orders: ", error);
        toast({
            variant: "destructive",
            title: "Error",
            description: "Could not fetch orders.",
        });
        setLoading(false);
    });

    return () => unsubscribe();
  }, [toast]);


  const handleStatusChange = async (order: Order, newStatus: Order['status']) => {
    const orderRef = doc(db, 'orders', order.id);
    try {
        if (newStatus === 'Failed' && order.status !== 'Failed') {
            // Refund the user if the order is marked as failed
            await runTransaction(db, async (transaction) => {
                const walletRef = doc(db, 'wallets', order.userId);
                const walletDoc = await transaction.get(walletRef);

                if (walletDoc.exists()) {
                    const currentBalance = walletDoc.data().balance;
                    const newBalance = currentBalance + order.productPrice;
                    transaction.update(walletRef, { balance: newBalance });
                }
                // If wallet doesn't exist, we can't refund, but we still mark as failed.
                
                transaction.update(orderRef, { status: newStatus });
            });
             toast({
                title: "Order Updated & Refunded",
                description: `Order marked as Failed. ৳${order.productPrice.toFixed(2)} refunded to ${order.userEmail}.`
            });
        } else {
             await updateDoc(orderRef, { status: newStatus });
             toast({
                title: "Order Updated",
                description: `Order has been marked as ${newStatus}.`
            });
        }
    } catch (error) {
        console.error("Error updating order status: ", error);
        toast({
            variant: "destructive",
            title: "Error",
            description: "Failed to update order status.",
        });
    }
  };

  const allCount = orders.length;
  const pendingCount = orders.filter(o => o.status === 'Pending').length;
  const completedCount = orders.filter(o => o.status === 'Completed').length;
  const failedCount = orders.filter(o => o.status === 'Failed').length;

  const renderTable = (filteredOrders: Order[]) => (
    <Card>
      <CardContent className="pt-6">
        {loading ? (
            <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        ) : filteredOrders.length === 0 ? (
            <Alert>
                <AlertTitle>No Orders Found</AlertTitle>
                <AlertDescription>There are no orders with this status.</AlertDescription>
            </Alert>
        ) : (
          <div className="overflow-x-auto">
            <Table>
                <TableHeader>
                    <TableRow>
                    <TableHead>Player ID</TableHead>
                    <TableHead className="hidden sm:table-cell">User Email</TableHead>
                    <TableHead>Package</TableHead>
                    <TableHead className="hidden md:table-cell">Price</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="hidden lg:table-cell">Date</TableHead>
                    <TableHead>
                        <span className="sr-only">Actions</span>
                    </TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {filteredOrders.map((order) => (
                    <TableRow key={order.id}>
                        <TableCell className="font-medium">{order.playerId}</TableCell>
                        <TableCell className="hidden sm:table-cell">{order.userEmail}</TableCell>
                        <TableCell>{order.productName}</TableCell>
                        <TableCell className="hidden md:table-cell">৳{order.productPrice.toFixed(2)}</TableCell>
                        <TableCell>
                            <OrderStatusBadge status={order.status} />
                        </TableCell>
                        <TableCell className="hidden lg:table-cell">{order.createdAt.toLocaleString()}</TableCell>
                        <TableCell>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                            <Button aria-haspopup="true" size="icon" variant="ghost">
                                <MoreHorizontal className="h-4 w-4" />
                                <span className="sr-only">Toggle menu</span>
                            </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuItem onClick={() => handleStatusChange(order, 'Completed')}>
                                Mark as Completed
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleStatusChange(order, 'Pending')}>
                                Mark as Pending
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleStatusChange(order, 'Failed')}>
                                Mark as Failed
                            </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                        </TableCell>
                    </TableRow>
                    ))}
                </TableBody>
            </Table>
            </div>
        )}
      </CardContent>
    </Card>
  )

  return (
    <Tabs defaultValue="all">
      <div className="flex items-center">
        <TabsList className="overflow-x-auto h-auto py-1">
            <TabsTrigger value="all">All ({allCount})</TabsTrigger>
            <TabsTrigger value="pending">Pending ({pendingCount})</TabsTrigger>
            <TabsTrigger value="completed">Completed ({completedCount})</TabsTrigger>
            <TabsTrigger value="failed">Failed ({failedCount})</TabsTrigger>
        </TabsList>
        <div className="ml-auto flex items-center gap-2">
          <Button size="sm" variant="outline" className="h-8 gap-1" disabled>
            <File className="h-3.5 w-3.5" />
            <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
              Export
            </span>
          </Button>
        </div>
      </div>
      <TabsContent value="all">{renderTable(orders)}</TabsContent>
      <TabsContent value="pending">{renderTable(orders.filter(o => o.status === 'Pending'))}</TabsContent>
      <TabsContent value="completed">{renderTable(orders.filter(o => o.status === 'Completed'))}</TabsContent>
      <TabsContent value="failed">{renderTable(orders.filter(o => o.status === 'Failed'))}</TabsContent>
    </Tabs>
  );
}
