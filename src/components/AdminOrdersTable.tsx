'use client';

import * as React from 'react';
import {
  ChevronDown,
  MoreHorizontal,
  File,
  ListFilter,
} from 'lucide-react';

import { orders as mockOrders } from '@/lib/data';
import type { Order } from '@/lib/types';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
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

export default function AdminOrdersTable() {
  const [orders, setOrders] = React.useState<Order[]>(mockOrders);

  const handleStatusChange = (orderId: string, newStatus: Order['status']) => {
    setOrders(
      orders.map((order) =>
        order.id === orderId ? { ...order, status: newStatus } : order
      )
    );
  };

  const allCount = orders.length;
  const pendingCount = orders.filter(o => o.status === 'Pending').length;
  const completedCount = orders.filter(o => o.status === 'Completed').length;
  const failedCount = orders.filter(o => o.status === 'Failed').length;

  const renderTable = (filteredOrders: Order[]) => (
    <Card>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Player ID</TableHead>
              <TableHead>Package</TableHead>
              <TableHead>Payment</TableHead>
              <TableHead>Transaction ID</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>
                <span className="sr-only">Actions</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredOrders.map((order) => (
              <TableRow key={order.id}>
                <TableCell className="font-medium">{order.playerId}</TableCell>
                <TableCell>{order.product.name}</TableCell>
                <TableCell>{order.paymentMethod}</TableCell>
                <TableCell>{order.transactionId}</TableCell>
                <TableCell>
                    <OrderStatusBadge status={order.status} />
                </TableCell>
                <TableCell>{order.timestamp.toLocaleDateString()}</TableCell>
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
                      <DropdownMenuItem onClick={() => handleStatusChange(order.id, 'Completed')}>
                        Mark as Completed
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleStatusChange(order.id, 'Pending')}>
                        Mark as Pending
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleStatusChange(order.id, 'Failed')}>
                        Mark as Failed
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {filteredOrders.length === 0 && <div className="text-center p-8 text-muted-foreground">No orders to display.</div>}
      </CardContent>
    </Card>
  )

  return (
    <Tabs defaultValue="all">
      <div className="flex items-center">
        <TabsList>
            <TabsTrigger value="all">All ({allCount})</TabsTrigger>
            <TabsTrigger value="pending">Pending ({pendingCount})</TabsTrigger>
            <TabsTrigger value="completed">Completed ({completedCount})</TabsTrigger>
            <TabsTrigger value="failed">Failed ({failedCount})</TabsTrigger>
        </TabsList>
        <div className="ml-auto flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="h-8 gap-1">
                <ListFilter className="h-3.5 w-3.5" />
                <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                  Filter
                </span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuLabel>Filter by status</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuCheckboxItem checked>Pending</DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem checked>Completed</DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem checked>Failed</DropdownMenuCheckboxItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Button size="sm" variant="outline" className="h-8 gap-1">
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
