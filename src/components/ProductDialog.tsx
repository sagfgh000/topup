
'use client';

import * as React from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import type { Product } from '@/lib/types';
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

const productSchema = z.object({
  name: z.string().min(3, 'Product name is required.'),
  price: z.coerce.number().min(0, 'Price must be a positive number.'),
  game: z.enum(['Free Fire', 'MLBB']),
});

type ProductFormData = Omit<Product, 'id'>;

type ProductDialogProps = {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onSave: (product: ProductFormData) => void;
  product: Product | null;
};

export function ProductDialog({
  isOpen,
  onOpenChange,
  onSave,
  product,
}: ProductDialogProps) {
  const form = useForm<z.infer<typeof productSchema>>({
    resolver: zodResolver(productSchema),
  });
  
  React.useEffect(() => {
    if (isOpen && product) {
      form.reset(product);
    } else if (isOpen && !product) {
      form.reset({ name: '', price: 0, game: 'Free Fire' });
    }
  }, [product, form, isOpen]);


  const onSubmit = (values: z.infer<typeof productSchema>) => {
    onSave(values);
    onOpenChange(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="font-headline">
            {product ? 'Edit Product' : 'Add Product'}
          </DialogTitle>
          <DialogDescription>
            {product
              ? 'Make changes to the product here. Click save when you are done.'
              : 'Add a new product to your store. Click save when you are done.'}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4 py-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., 100 Diamonds" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="price"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Price (Taka)</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="50" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="game"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Game</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a game" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Free Fire">Free Fire</SelectItem>
                      <SelectItem value="MLBB">MLBB</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
               <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
              <Button type="submit">Save changes</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
