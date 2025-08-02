'use client';

import * as React from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { AnimatePresence, motion } from 'framer-motion';

import { orders as allOrders } from '@/lib/data';
import type { Order } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import OrderStatusBadge from './OrderStatusBadge';

const searchFormSchema = z.object({
  playerId: z.string().min(1, 'Please enter your Player ID.'),
});

export default function OrderHistory() {
  const [userOrders, setUserOrders] = React.useState<Order[]>([]);
  const [searched, setSearched] = React.useState(false);

  const form = useForm<z.infer<typeof searchFormSchema>>({
    resolver: zodResolver(searchFormSchema),
    defaultValues: { playerId: '' },
  });

  function onSubmit(values: z.infer<typeof searchFormSchema>) {
    const foundOrders = allOrders.filter(order => order.playerId === values.playerId);
    setUserOrders(foundOrders);
    setSearched(true);
  }

  return (
    <div className="space-y-6">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="flex items-end gap-4">
          <FormField
            control={form.control}
            name="playerId"
            render={({ field }) => (
              <FormItem className="flex-grow">
                <FormLabel>Player ID</FormLabel>
                <FormControl>
                  <Input placeholder="123456789" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit">Search</Button>
        </form>
      </Form>

      <AnimatePresence>
        {searched && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            {userOrders.length > 0 ? (
              <div className="border rounded-lg overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Order ID</TableHead>
                      <TableHead>Package</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead className="text-right">Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {userOrders.map((order) => (
                      <TableRow key={order.id}>
                        <TableCell className="font-medium">{order.id}</TableCell>
                        <TableCell>{order.product.name}</TableCell>
                        <TableCell>{order.timestamp.toLocaleDateString()}</TableCell>
                        <TableCell className="text-right">
                          <OrderStatusBadge status={order.status} />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="text-center py-12 bg-muted rounded-lg">
                <p className="text-muted-foreground">No orders found for this Player ID.</p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
