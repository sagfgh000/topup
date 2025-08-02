'use client';

import * as React from 'react';
import { db } from '@/lib/firebase';
import {
  collection,
  onSnapshot,
  query,
  orderBy,
  doc,
  writeBatch,
} from 'firebase/firestore';
import type { TopUpRequest } from '@/lib/types';
import { Button } from '@/components/ui/button';
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
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { Loader2 } from 'lucide-react';

const StatusBadge = ({ status }: { status: TopUpRequest['status'] }) => {
  const variant = {
    Pending: 'secondary',
    Approved: 'default',
    Rejected: 'destructive',
  }[status] as 'secondary' | 'default' | 'destructive';

  const className = {
    Pending:
      'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/50 dark:text-yellow-300 dark:border-yellow-700',
    Approved:
      'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/50 dark:text-green-300 dark:border-green-700',
    Rejected:
      'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/50 dark:text-red-300 dark:border-red-700',
  }[status];

  return (
    <Badge variant={variant} className={cn('font-semibold', className)}>
      {status}
    </Badge>
  );
};

export default function AdminTopUpsTable() {
  const [requests, setRequests] = React.useState<TopUpRequest[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [processingId, setProcessingId] = React.useState<string | null>(null);
  const { toast } = useToast();

  React.useEffect(() => {
    const q = query(
      collection(db, 'topUpRequests'),
      orderBy('createdAt', 'desc')
    );
    const unsubscribe = onSnapshot(
      q,
      (querySnapshot) => {
        const requestsData: TopUpRequest[] = [];
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          requestsData.push({
            id: doc.id,
            ...data,
            createdAt: (data.createdAt as any).toDate(),
          } as TopUpRequest);
        });
        setRequests(requestsData);
        setLoading(false);
      },
      (error) => {
        console.error('Error fetching top-up requests: ', error);
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'Could not fetch top-up requests.',
        });
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [toast]);

  const handleRequest = async (
    request: TopUpRequest,
    newStatus: 'Approved' | 'Rejected'
  ) => {
    if (!request.id) return;
    setProcessingId(request.id);
    const batch = writeBatch(db);

    const requestRef = doc(db, 'topUpRequests', request.id);
    batch.update(requestRef, { status: newStatus });

    if (newStatus === 'Approved') {
      const walletRef = doc(db, 'wallets', request.userId);
      // Firestore transactions require a read before a write,
      // but for simplicity here we just increment.
      // A Cloud Function would be better for robust transactions.
      // We will read the wallet first to get the balance
       try {
        const walletDoc = await db.collection('wallets').doc(request.userId).get();
        const currentBalance = walletDoc.exists ? walletDoc.data()?.balance || 0 : 0;
        const newBalance = currentBalance + request.amount;
        batch.set(walletRef, { balance: newBalance }, { merge: true });
       } catch (error) {
           console.error("Failed to read wallet, using increment which might be less safe.", error);
            toast({
                variant: 'destructive',
                title: 'Error',
                description: 'Could not update wallet balance safely.',
            });
           setProcessingId(null);
           return;
       }
    }

    try {
      await batch.commit();
      toast({
        title: `Request ${newStatus}`,
        description: `Request from ${request.userEmail} has been ${newStatus.toLowerCase()}.`,
      });
    } catch (error) {
      console.error('Error processing request: ', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to process the request.',
      });
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Top-Up Requests</CardTitle>
        <CardDescription>
          Approve or reject wallet top-up requests from users.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
           <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        ) : requests.length === 0 ? (
          <Alert>
            <AlertTitle>No Requests</AlertTitle>
            <AlertDescription>
              There are currently no pending top-up requests.
            </AlertDescription>
          </Alert>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Method</TableHead>
                <TableHead>Transaction ID</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {requests.map((req) => (
                <TableRow key={req.id}>
                  <TableCell className="font-medium">{req.userEmail}</TableCell>
                  <TableCell>৳{req.amount.toFixed(2)}</TableCell>
                  <TableCell>{req.paymentMethod}</TableCell>
                  <TableCell>{req.transactionId}</TableCell>
                  <TableCell>{req.createdAt.toLocaleString()}</TableCell>
                  <TableCell>
                    <StatusBadge status={req.status} />
                  </TableCell>
                  <TableCell className="text-right">
                    {req.status === 'Pending' && (
                      <div className="flex gap-2 justify-end">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleRequest(req, 'Approved')}
                          disabled={!!processingId}
                        >
                          {processingId === req.id ? <Loader2 className="h-4 w-4 animate-spin"/> : 'Approve'}
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleRequest(req, 'Rejected')}
                          disabled={!!processingId}
                        >
                           {processingId === req.id ? <Loader2 className="h-4 w-4 animate-spin"/> : 'Reject'}
                        </Button>
                      </div>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
