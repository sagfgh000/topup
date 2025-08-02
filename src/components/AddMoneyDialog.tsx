
'use client';

import * as React from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuth } from '@/contexts/AuthContext';
import { db } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

import type { TopUpRequest } from '@/lib/types';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { Copy } from 'lucide-react';

const addMoneySchema = z.object({
  amount: z.coerce.number().min(10, 'Minimum top-up is 10 Taka.'),
  paymentMethod: z.enum(['bKash', 'Nagad']),
  transactionId: z.string().min(5, 'Transaction ID is required.'),
});

const paymentAccounts = {
    bKash: '01712345678',
    Nagad: '01812345678',
}

type AddMoneyDialogProps = {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
};

export function AddMoneyDialog({
  isOpen,
  onOpenChange,
}: AddMoneyDialogProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const form = useForm<z.infer<typeof addMoneySchema>>({
    resolver: zodResolver(addMoneySchema),
    defaultValues: {
        amount: 50,
        paymentMethod: 'bKash',
        transactionId: ''
    }
  });

  const paymentMethod = form.watch('paymentMethod');
  const accountNumber = paymentAccounts[paymentMethod];

  const handleCopyToClipboard = () => {
    navigator.clipboard.writeText(accountNumber);
    toast({ title: 'Copied!', description: 'Account number copied to clipboard.' });
  }

  const onSubmit = async (values: z.infer<typeof addMoneySchema>) => {
    if (!user) {
        toast({ variant: 'destructive', title: 'Error', description: 'You must be logged in.' });
        return;
    }
    setIsSubmitting(true);
    try {
        const topUpRequest: TopUpRequest = {
            userId: user.uid,
            userEmail: user.email || 'N/A',
            amount: values.amount,
            paymentMethod: values.paymentMethod,
            transactionId: values.transactionId,
            status: 'Pending',
            createdAt: new Date(),
        };
        await addDoc(collection(db, 'topUpRequests'), topUpRequest);
        
        toast({
            title: 'Request Submitted',
            description: 'Your top-up request has been sent for approval.'
        });
        onOpenChange(false);
        form.reset();
    } catch (error) {
        console.error("Error submitting top-up request: ", error);
        toast({ variant: 'destructive', title: 'Error', description: 'Failed to submit request.' });
    } finally {
        setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-headline">Add Money to Wallet</DialogTitle>
          <DialogDescription>
            Send money to the account below and submit the transaction details.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
             <FormField
              control={form.control}
              name="paymentMethod"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Payment Method</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a payment method" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="bKash">bKash</SelectItem>
                      <SelectItem value="Nagad">Nagad</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <Alert>
                <AlertTitle className="font-bold">Send Money (Send Money)</AlertTitle>
                <AlertDescription className="flex items-center justify-between">
                   <span className="text-lg font-mono">{accountNumber}</span>
                   <Button type="button" variant="ghost" size="icon" onClick={handleCopyToClipboard}>
                       <Copy className="h-4 w-4" />
                   </Button>
                </AlertDescription>
            </Alert>

            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Amount (Taka)</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="50" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
             <FormField
              control={form.control}
              name="transactionId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Transaction ID (TrxID)</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., 9C8B7A6D5E" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Submitting...' : 'Submit Request'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
