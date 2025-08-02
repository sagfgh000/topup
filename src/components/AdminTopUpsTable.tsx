
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
  getDoc,
  runTransaction,
  updateDoc,
} from 'firebase/firestore';
import type { TopUpRequest, Wallet } from '@/lib/types';
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
    <Badge variant={variant} className={cn('font-semibold whitespace-nowrap', className)}>
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

    const requestRef = doc(db, 'topUpRequests', request.id);

    try {
      if (newStatus === 'Approved') {
        // Use a transaction to ensure atomicity: update balance AND request status
        await runTransaction(db, async (transaction) => {
            const walletRef = doc(db, 'wallets', request.userId);
            const walletDoc = await transaction.get(walletRef);
            
            // Only add funds if the request has not been approved before.
            if (request.status !== 'Approved') {
                if (!walletDoc.exists()) {
                    // If wallet doesn't exist, create it with the top-up amount
                    transaction.set(walletRef, { balance: request.amount });
                } else {
                    const currentBalance = walletDoc.data().balance;
                    const newBalance = currentBalance + request.amount;
                    transaction.update(walletRef, { balance: newBalance });
                }
            }
            
            // Finally, update the request status
            transaction.update(requestRef, { status: newStatus });
        });
      } else {
        // If rejecting, just update the status
        // No need to touch the wallet if request is rejected
        await updateDoc(requestRef, { status: newStatus });
      }
        
      toast({
          title: `Request ${newStatus}`,
          description: `Request from ${request.userEmail} has been ${newStatus.toLowerCase()}.`,
      });

    } catch (error) {
        console.error('Error processing request: ', error);
        toast({
            variant: 'destructive',
            title: 'Error',
            description: 'Failed to process the request. The user wallet might not exist or another error occurred.',
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
          <div className="overflow-x-auto">
            <Table>
                <TableHeader>
                <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead className="hidden sm:table-cell">Method</TableHead>
                    <TableHead>Transaction ID</TableHead>
                    <TableHead className="hidden lg:table-cell">Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                </TableRow>
                </TableHeader>
                <TableBody>
                {requests.map((req) => (
                    <TableRow key={req.id}>
                    <TableCell className="font-medium truncate max-w-[120px]">{req.userEmail}</TableCell>
                    <TableCell>৳{req.amount.toFixed(2)}</TableCell>
                    <TableCell className="hidden sm:table-cell">{req.paymentMethod}</TableCell>
                    <TableCell className="truncate max-w-[100px]">{req.transactionId}</TableCell>
                    <TableCell className="hidden lg:table-cell whitespace-nowrap">{req.createdAt.toLocaleDateString()}</TableCell>
                    <TableCell>
                        <StatusBadge status={req.status} />
                    </TableCell>
                    <TableCell className="text-right">
                        {req.status === 'Pending' && (
                        <div className="flex flex-col sm:flex-row gap-2 justify-end">
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
          </div>
        )}
      </CardContent>
    </Card>
  );
}
