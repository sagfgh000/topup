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
import { Loader2 } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';

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

  React.useEffect(() => {
    setLoading(true);
    // This is a more complex query. We first get all orders, then aggregate by user.
    const fetchCustomerData = async () => {
      const ordersQuery = query(collection(db, 'orders'));
      const querySnapshot = await getDocs(ordersQuery);

      const customerData: { [uid: string]: { email: string; totalSpent: number; orderCount: number } } = {};

      querySnapshot.forEach((doc) => {
        const order = doc.data();
        const { userId, userEmail, productPrice } = order;

        if (!customerData[userId]) {
          customerData[userId] = {
            email: userEmail,
            totalSpent: 0,
            orderCount: 0,
          };
        }
        customerData[userId].totalSpent += productPrice;
        customerData[userId].orderCount += 1;
      });

      const customerList: Customer[] = Object.entries(customerData).map(([uid, data]) => ({
        id: uid,
        ...data,
      }));
      
      // Also get users who may have signed up but not ordered
      const topupsQuery = query(collection(db, 'topUpRequests'));
      const topupsSnapshot = await getDocs(topupsQuery);
      topupsSnapshot.forEach((doc) => {
          const topup = doc.data();
          const { userId, userEmail } = topup;
          if (!customerData[userId]) {
              customerList.push({
                  id: userId,
                  email: userEmail,
                  totalSpent: 0,
                  orderCount: 0,
              });
          }
      });


      setCustomers(customerList);
      setLoading(false);
    };

    fetchCustomerData().catch(console.error);
    
    // We can't use onSnapshot for this aggregation easily on the client-side.
    // For real-time updates here, a Cloud Function would be better.
    // So, we'll just fetch once on component mount.

  }, []);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Customers</CardTitle>
        <CardDescription>
          A list of all users who have placed orders or made topups.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
           <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        ) : customers.length === 0 ? (
          <Alert>
            <AlertTitle>No Customers Found</AlertTitle>
            <AlertDescription>
              No users have placed an order or made a top-up yet.
            </AlertDescription>
          </Alert>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Email</TableHead>
                <TableHead>Orders Placed</TableHead>
                <TableHead className="text-right">Total Spent</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {customers.map((customer) => (
                <TableRow key={customer.id}>
                  <TableCell className="font-medium">{customer.email}</TableCell>
                  <TableCell>{customer.orderCount}</TableCell>
                  <TableCell className="text-right">৳{customer.totalSpent.toFixed(2)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
