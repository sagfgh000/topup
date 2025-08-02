'use client';

import * as React from 'react';
import Image from 'next/image';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Gem, CreditCard, ShieldCheck } from 'lucide-react';

import { products } from '@/lib/data';
import type { Product } from '@/lib/types';
import { cn } from '@/lib/utils';
import Header from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

const orderFormSchema = z.object({
  playerId: z.string().min(5, 'Player ID must be at least 5 characters.'),
  paymentMethod: z.enum(['bKash', 'Nagad', 'Rocket']),
  transactionId: z.string().min(5, 'Transaction ID is required.'),
});

export default function HomePage() {
  const [selectedPackage, setSelectedPackage] = React.useState<Product | null>(products[1]);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = React.useState(false);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof orderFormSchema>>({
    resolver: zodResolver(orderFormSchema),
    defaultValues: {
      playerId: '',
      paymentMethod: 'bKash',
      transactionId: '',
    },
  });

  function onSubmit(values: z.infer<typeof orderFormSchema>) {
    if (!selectedPackage) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Please select a package first.',
      });
      return;
    }
    console.log({ ...values, package: selectedPackage });
    setIsSuccessModalOpen(true);
    form.reset();
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow">
        <section className="relative h-64 md:h-80 w-full">
          <Image
            src="https://placehold.co/1600x600.png"
            alt="Free Fire banner"
            layout="fill"
            objectFit="cover"
            className="brightness-50"
            data-ai-hint="gaming background"
          />
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center text-white p-4">
            <h1 className="text-4xl md:text-6xl font-bold font-headline drop-shadow-lg">
              Diamond Depot
            </h1>
            <p className="mt-2 text-lg md:text-xl max-w-2xl drop-shadow-md">
              Instant Top-Ups for Free Fire. Get your diamonds quickly and securely.
            </p>
          </div>
        </section>

        <section className="container mx-auto px-4 py-8 md:py-12">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-16">
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="font-headline text-2xl flex items-center gap-2">
                  <Gem className="text-primary" />
                  1. Select Your Package
                </CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {products
                  .filter((p) => p.game === 'Free Fire')
                  .map((pkg) => (
                    <button
                      key={pkg.id}
                      onClick={() => setSelectedPackage(pkg)}
                      className={cn(
                        'p-4 rounded-lg border-2 text-center transition-all duration-200',
                        selectedPackage?.id === pkg.id
                          ? 'border-primary bg-primary/10 ring-2 ring-primary'
                          : 'border-border hover:border-primary/50 hover:bg-muted'
                      )}
                    >
                      <div className="font-bold text-lg">{pkg.name}</div>
                      <div className="text-primary font-semibold">{pkg.price} Taka</div>
                    </button>
                  ))}
              </CardContent>
            </Card>

            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="font-headline text-2xl flex items-center gap-2">
                  <CreditCard className="text-primary" />
                  2. Complete Your Order
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <FormField
                      control={form.control}
                      name="playerId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Free Fire Player ID / UID</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter your Player ID" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
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
                              <SelectItem value="Rocket">Rocket</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="transactionId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Transaction ID</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter your payment Transaction ID" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button type="submit" className="w-full font-bold text-lg py-6" disabled={!selectedPackage}>
                      <ShieldCheck className="mr-2 h-5 w-5" />
                      Submit Order
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </div>
        </section>
      </main>
      
      <AlertDialog open={isSuccessModalOpen} onOpenChange={setIsSuccessModalOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="font-headline text-2xl text-center">Order Submitted Successfully!</AlertDialogTitle>
            <AlertDialogDescription className="text-center">
              Your order for <strong>{selectedPackage?.name}</strong> has been received. Please wait for confirmation. You can track your order status on the 'Track Order' page.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={() => setIsSuccessModalOpen(false)}>Great!</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
