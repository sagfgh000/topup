'use client';

import { Gem } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Form, FormField, FormControl, FormItem, FormMessage } from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import React from 'react';

const adminLoginFormSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1, 'Password is required.'),
});


export default function AdminLoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [loading, setLoading] = React.useState(false);

  const form = useForm<z.infer<typeof adminLoginFormSchema>>({
    resolver: zodResolver(adminLoginFormSchema),
    defaultValues: {
      email: "kymt83091@gmail.com",
      password: "hinatAA109@#$",
    },
  });

  const handleLogin = async (values: z.infer<typeof adminLoginFormSchema>) => {
    setLoading(true);
    try {
      await login(values.email, values.password);
      // The admin layout will handle redirection based on the user's role.
      router.push('/admin/dashboard');
    } catch(e) {
      console.error(e);
      // Toast with error is shown from AuthContext
    } finally {
        setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-muted/40">
      <Card className="w-full max-w-sm shadow-2xl">
        <CardHeader className="text-center">
          <div className="flex justify-center items-center gap-2 mb-4">
             <Gem className="h-8 w-8 text-primary" />
             <CardTitle className="font-headline text-3xl">Diamond Depot</CardTitle>
          </div>
          <CardDescription>Admin Panel Login</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleLogin)} className="grid gap-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <Label htmlFor="email">Email</Label>
                    <FormControl>
                      <Input id="email" type="email" placeholder="admin@example.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <Label htmlFor="password">Password</Label>
                    <FormControl>
                      <Input id="password" type="password" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full mt-2" disabled={loading}>
                {loading ? 'Signing in...' : 'Sign In'}
              </Button>
            </form>
          </Form>
          <div className="mt-4 text-center text-sm">
            <Link href="/" className="underline text-muted-foreground hover:text-primary">
              Back to main site
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
