
'use client';

import * as React from 'react';
import { db } from '@/lib/firebase';
import { collection, onSnapshot, query, orderBy, getDocs, where } from 'firebase/firestore';
import type { User } from 'firebase/auth'; // We won't have direct user objects, just emails and UIDs from other collections

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Loader2, Search } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { Input } from './ui/input';

// Simplified customer type for our purposes
type Customer = {
  id: string; // This will be the UID
  email: string;
  totalSpent: number;
  orderCount: number;
};

export default function AdminCustomersTable() {
  const [customers, setCustomers] = React.useState<Customer[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [searchTerm, setSearchTerm] = React.useState('');

  React.useEffect(() => {
    setLoading(true);
    // This is a more complex query. We first get all orders, then aggregate by user.
    const fetchCustomerData = async () => {
      // Use a map to store aggregated data, ensuring each user is unique.
      const customerDataMap = new Map<string, { email: string; totalSpent: number; orderCount: number }>();

      // Get all orders
      const ordersQuery = query(collection(db, 'orders'));
      const ordersSnapshot = await getDocs(ordersQuery);

      ordersSnapshot.forEach((doc) => {
        const order = doc.data();
        const { userId, userEmail, productPrice, status } = order;
        
        if (!customerDataMap.has(userId)) {
          customerDataMap.set(userId, {
            email: userEmail,
            totalSpent: 0,
            orderCount: 0,
          });
        }
        
        const data = customerDataMap.get(userId)!;
        if (status === 'Completed') {
            data.totalSpent += productPrice;
        }
        data.orderCount += 1;
      });

      // Get all top-ups to find users who may not have ordered yet
      const topupsQuery = query(collection(db, 'topUpRequests'));
      const topupsSnapshot = await getDocs(topupsQuery);

      topupsSnapshot.forEach((doc) => {
          const topup = doc.data();
          const { userId, userEmail } = topup;
          // If the user from top-ups isn't already in our map from orders, add them.
          if (!customerDataMap.has(userId)) {
              customerDataMap.set(userId, {
                  email: userEmail,
                  totalSpent: 0,
                  orderCount: 0,
              });
          }
      });
      
      // Convert the map to an array for rendering
      const customerList: Customer[] = Array.from(customerDataMap.entries()).map(([uid, data]) => ({
        id: uid,
        ...data,
      }));

      setCustomers(customerList);
      setLoading(false);
    };

    fetchCustomerData().catch(console.error);
    
    // We can't use onSnapshot for this aggregation easily on the client-side.
    // For real-time updates here, a Cloud Function would be better.
    // So, we'll just fetch once on component mount.

  }, []);

  const filteredCustomers = customers.filter(customer => 
    customer.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>Customers</CardTitle>
        <CardDescription>
          A list of all users who have placed orders or made topups.
        </CardDescription>
        <div className="relative mt-2">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
                type="search"
                placeholder="Search by email..."
                className="w-full rounded-lg bg-background pl-8 md:w-[200px] lg:w-[320px]"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
            />
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
           <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        ) : filteredCustomers.length === 0 ? (
          <Alert>
            <AlertTitle>No Customers Found</AlertTitle>
            <AlertDescription>
              Your search for "{searchTerm}" did not match any customers.
            </AlertDescription>
          </Alert>
        ) : (
          <div className="border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Email</TableHead>
                <TableHead>Orders Placed</TableHead>
                <TableHead className="text-right">Total Spent (Completed)</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCustomers.map((customer) => (
                <TableRow key={customer.id}>
                  <TableCell className="font-medium">{customer.email}</TableCell>
                  <TableCell>{customer.orderCount}</TableCell>
                  <TableCell className="text-right">৳{customer.totalSpent.toFixed(2)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
