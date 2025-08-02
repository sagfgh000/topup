
'use client';

import * as React from 'react';
import Image from 'next/image';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Gem, CreditCard, ShieldCheck, Loader2 } from 'lucide-react';
import { collection, addDoc, doc, getDoc, runTransaction, serverTimestamp, onSnapshot, query, orderBy } from 'firebase/firestore';

import type { Product, Order, Wallet } from '@/lib/types';
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
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { db } from '@/lib/firebase';
import { Skeleton } from '@/components/ui/skeleton';

const orderFormSchema = z.object({
  playerId: z.string().min(5, 'Player ID must be at least 5 characters.'),
});

export default function HomePage() {
  const [products, setProducts] = React.useState<Product[]>([]);
  const [productsLoading, setProductsLoading] = React.useState(true);
  const [selectedPackage, setSelectedPackage] = React.useState<Product | null>(null);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = React.useState(false);
  const [isLoginPromptOpen, setIsLoginPromptOpen] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const { toast } = useToast();
  const { user } = useAuth();
  const router = useRouter();

  const form = useForm<z.infer<typeof orderFormSchema>>({
    resolver: zodResolver(orderFormSchema),
    defaultValues: {
      playerId: '',
    },
  });
  
  React.useEffect(() => {
    const q = query(collection(db, 'products'), orderBy('price', 'asc'));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const productsData: Product[] = [];
        querySnapshot.forEach((doc) => {
            productsData.push({ id: doc.id, ...doc.data() } as Product);
        });
        setProducts(productsData);
        if (productsData.length > 1) {
            setSelectedPackage(productsData[1]);
        } else if (productsData.length > 0) {
            setSelectedPackage(productsData[0]);
        }
        setProductsLoading(false);
    }, (error) => {
        console.error("Error fetching products: ", error);
        toast({ variant: 'destructive', title: 'Error', description: 'Could not fetch products.' });
        setProductsLoading(false);
    });

    return () => unsubscribe();
  }, [toast]);


  async function onSubmit(values: z.infer<typeof orderFormSchema>) {
    if (!user) {
      setIsLoginPromptOpen(true);
      return;
    }
    if (!selectedPackage) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Please select a package first.',
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const walletRef = doc(db, 'wallets', user.uid);
      const orderCost = selectedPackage.price;

      await runTransaction(db, async (transaction) => {
        const walletDoc = await transaction.get(walletRef);
        const currentBalance = walletDoc.exists() ? (walletDoc.data() as Wallet).balance : 0;

        if (currentBalance < orderCost) {
          throw new Error('Insufficient wallet balance. Please add money to your wallet.');
        }

        const newBalance = currentBalance - orderCost;
        transaction.set(walletRef, { balance: newBalance }, { merge: true });

        const newOrder: Omit<Order, 'id' | 'createdAt'> = {
          userId: user.uid,
          userEmail: user.email || 'N/A',
          playerId: values.playerId,
          productName: selectedPackage.name,
          productPrice: selectedPackage.price,
          status: 'Pending',
        };

        const ordersCollection = collection(db, 'orders');
        await addDoc(ordersCollection, {
          ...newOrder,
          createdAt: serverTimestamp(),
        });
      });
      
      setIsSuccessModalOpen(true);
      form.reset();

    } catch (error: any) {
      console.error("Order submission failed: ", error);
      toast({
        variant: 'destructive',
        title: 'Order Failed',
        description: error.message || 'There was a problem submitting your order.',
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow">
        <section className="relative h-64 md:h-80 w-full">
          <Image
            src="/free-fire-banner.jpg"
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
                {productsLoading ? (
                    Array.from({ length: 6 }).map((_, index) => (
                        <Skeleton key={index} className="h-24 w-full" />
                    ))
                ) : (
                    products
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
                    ))
                )}
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
                    <div className="text-sm text-muted-foreground p-4 bg-muted rounded-lg border">
                      The cost for <strong>{selectedPackage?.name || '...'}</strong> ({selectedPackage ? `${selectedPackage.price} Taka` : '...'}) will be deducted from your wallet balance.
                    </div>
                    <Button type="submit" className="w-full font-bold text-lg py-6" disabled={!selectedPackage || isSubmitting || productsLoading}>
                      {isSubmitting ? (
                        <>
                          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                          Submitting...
                        </>
                      ) : (
                        <>
                          <ShieldCheck className="mr-2 h-5 w-5" />
                          Submit Order
                        </>
                      )}
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
              Your order for <strong>{selectedPackage?.name}</strong> has been received and the amount has been deducted from your wallet. Please wait for confirmation. You can track your order status on the 'Track Order' page.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={() => setIsSuccessModalOpen(false)}>Great!</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      
      <AlertDialog open={isLoginPromptOpen} onOpenChange={setIsLoginPromptOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Authentication Required</AlertDialogTitle>
            <AlertDialogDescription>
              You need to be logged in to place an order. Would you like to go to the login page?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => router.push('/login')}>Login</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

    