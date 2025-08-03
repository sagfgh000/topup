
'use client';

import * as React from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

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

type Customer = {
  id: string;
  email: string;
  balance: number;
};

const balanceSchema = z.object({
  balance: z.coerce.number().min(0, 'Balance must be a non-negative number.'),
});

type EditBalanceDialogProps = {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  customer: Customer | null;
  onSave: (customerId: string, newBalance: number) => void;
};

export function EditBalanceDialog({
  isOpen,
  onOpenChange,
  customer,
  onSave,
}: EditBalanceDialogProps) {
  const form = useForm<z.infer<typeof balanceSchema>>({
    resolver: zodResolver(balanceSchema),
  });
  
  React.useEffect(() => {
    if (customer) {
      form.reset({ balance: customer.balance });
    }
  }, [customer, form]);

  const onSubmit = (values: z.infer<typeof balanceSchema>) => {
    if (customer) {
      onSave(customer.id, values.balance);
    }
  };

  if (!customer) {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-headline">Edit Wallet Balance</DialogTitle>
          <DialogDescription>
            Adjust the wallet balance for <span className="font-semibold text-primary">{customer.email}</span>.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
            <FormField
              control={form.control}
              name="balance"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>New Balance (Taka)</FormLabel>
                  <FormControl>
                    <Input type="number" step="0.01" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
               <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
               <Button type="submit">Save Changes</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
