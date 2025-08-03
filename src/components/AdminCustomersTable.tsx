
'use client';

import * as React from 'react';
import { db } from '@/lib/firebase';
import { collection, onSnapshot, query, getDocs, doc, updateDoc } from 'firebase/firestore';
import type { Wallet } from '@/lib/types';
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
import { Button } from './ui/button';
import { EditBalanceDialog } from './EditBalanceDialog';
import { useToast } from '@/hooks/use-toast';

// Updated customer type to include wallet balance
type Customer = {
  id: string; // This will be the UID
  email: string;
  totalSpent: number;
  orderCount: number;
  balance: number;
};

export default function AdminCustomersTable() {
  const [customers, setCustomers] = React.useState<Customer[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [searchTerm, setSearchTerm] = React.useState('');
  const [editingCustomer, setEditingCustomer] = React.useState<Customer | null>(null);
  const { toast } = useToast();

  React.useEffect(() => {
    const fetchCustomerData = async () => {
      setLoading(true);
      const customerDataMap = new Map<string, { email: string; totalSpent: number; orderCount: number; balance: number }>();

      // Get all wallets to initialize every user with a wallet
      const walletsSnapshot = await getDocs(collection(db, 'wallets'));
      walletsSnapshot.forEach((doc) => {
          const wallet = doc.data() as Wallet;
          // We need user email, which isn't stored on the wallet. We'll get it from orders/topups.
          customerDataMap.set(doc.id, {
              email: '', // will be populated later
              totalSpent: 0,
              orderCount: 0,
              balance: wallet.balance || 0,
          });
      });

      // Get all orders
      const ordersQuery = query(collection(db, 'orders'));
      const ordersSnapshot = await getDocs(ordersQuery);

      ordersSnapshot.forEach((doc) => {
        const order = doc.data();
        const { userId, userEmail, productPrice, status } = order;
        
        if (!customerDataMap.has(userId)) {
          customerDataMap.set(userId, { email: userEmail, totalSpent: 0, orderCount: 0, balance: 0 });
        }
        
        const data = customerDataMap.get(userId)!;
        if (userEmail) data.email = userEmail;
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
          if (!customerDataMap.has(userId)) {
              customerDataMap.set(userId, { email: userEmail, totalSpent: 0, orderCount: 0, balance: 0 });
          } else {
              const data = customerDataMap.get(userId)!;
              if (userEmail) data.email = userEmail;
          }
      });
      
      const customerList: Customer[] = Array.from(customerDataMap.entries()).map(([uid, data]) => ({
        id: uid,
        ...data,
      }));

      setCustomers(customerList);
      setLoading(false);
    };

    fetchCustomerData().catch(console.error);
    
  }, []);

  const handleEditBalance = (customer: Customer) => {
    setEditingCustomer(customer);
  };

  const handleSaveBalance = async (customerId: string, newBalance: number) => {
    const walletRef = doc(db, 'wallets', customerId);
    try {
        await updateDoc(walletRef, { balance: newBalance });
        toast({ title: 'Success', description: "User's balance updated successfully." });
        // Update local state to reflect the change immediately
        setCustomers(customers.map(c => c.id === customerId ? { ...c, balance: newBalance } : c));
        setEditingCustomer(null); // Close dialog
    } catch (error) {
        console.error('Failed to update balance:', error);
        toast({ variant: 'destructive', title: 'Error', description: 'Failed to update user balance.' });
    }
  };

  const filteredCustomers = customers.filter(customer => 
    customer.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <>
    <Card>
      <CardHeader>
        <CardTitle>Customers</CardTitle>
        <CardDescription>
          View and manage all registered users and their wallet balances.
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
                <TableHead>Orders</TableHead>
                <TableHead>Total Spent</TableHead>
                <TableHead>Wallet Balance</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCustomers.map((customer) => (
                <TableRow key={customer.id}>
                  <TableCell className="font-medium">{customer.email}</TableCell>
                  <TableCell>{customer.orderCount}</TableCell>
                  <TableCell>৳{customer.totalSpent.toFixed(2)}</TableCell>
                  <TableCell className="font-semibold">৳{customer.balance.toFixed(2)}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="outline" size="sm" onClick={() => handleEditBalance(customer)}>
                        Edit Balance
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          </div>
        )}
      </CardContent>
    </Card>
    <EditBalanceDialog 
        isOpen={!!editingCustomer}
        onOpenChange={(isOpen) => !isOpen && setEditingCustomer(null)}
        customer={editingCustomer}
        onSave={handleSaveBalance}
    />
    </>
  );
}
