
'use client';

import { useState } from 'react';
import { Gem, Mail } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';
import { Separator } from '@/components/ui/separator';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';


const GoogleIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="24px" height="24px" {...props}>
        <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12s5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24s8.955,20,20,20s20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"/>
        <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"/>
        <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.222,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"/>
        <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.574l6.19,5.238C39.99,35.091,44,29.891,44,24C44,22.659,43.862,21.35,43.611,20.083z"/>
    </svg>
)

const loginFormSchema = z.object({
  email: z.string().email({ message: 'Please enter a valid email.' }),
  password: z.string().min(1, { message: 'Password is required.' }),
});

const forgotPasswordSchema = z.object({
    email: z.string().email({ message: 'Please enter a valid email.' }),
});


export default function LoginPage() {
  const router = useRouter();
  const { login, loginWithGoogle, sendPasswordReset } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);
  const [isResetDialogOpen, setIsResetDialogOpen] = useState(false);

  const form = useForm<z.infer<typeof loginFormSchema>>({
    resolver: zodResolver(loginFormSchema),
    defaultValues: { email: '', password: '' },
  });

  const forgotPasswordForm = useForm<z.infer<typeof forgotPasswordSchema>>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: '' }
  });

  const handleLogin = async (values: z.infer<typeof loginFormSchema>) => {
    setLoading(true);
    try {
      await login(values.email, values.password);
      router.push('/dashboard');
    } catch (error) {
      console.error('Failed to login', error);
      // Error is handled by toast in AuthContext
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setGoogleLoading(true);
    try {
      await loginWithGoogle();
      router.push('/dashboard');
    } catch (error) {
      console.error('Failed to login with Google', error);
      // Error is handled by toast in AuthContext
    } finally {
      setGoogleLoading(false);
    }
  }
  
  const handlePasswordReset = async (values: z.infer<typeof forgotPasswordSchema>) => {
      setResetLoading(true);
      try {
          await sendPasswordReset(values.email);
          toast({
              title: "Password Reset Email Sent",
              description: "Please check your inbox for instructions to reset your password.",
          });
          setIsResetDialogOpen(false);
          forgotPasswordForm.reset();
      } catch (error) {
           console.error("Failed to send password reset", error);
           // Error is handled by toast in AuthContext
      } finally {
          setResetLoading(false);
      }
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-muted/40">
      <Card className="w-full max-w-sm shadow-2xl">
        <CardHeader className="text-center">
          <Link href="/" className="flex justify-center items-center gap-2 mb-4">
            <Gem className="h-8 w-8 text-primary" />
            <CardTitle className="font-headline text-3xl">Diamond Depot</CardTitle>
          </Link>
          <CardDescription>Welcome back! Please sign in.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleLogin)} className="grid gap-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <Label>Email</Label>
                    <FormControl>
                      <Input type="email" placeholder="you@example.com" {...field} />
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
                    <div className="flex items-center justify-between">
                      <Label>Password</Label>
                      <AlertDialog open={isResetDialogOpen} onOpenChange={setIsResetDialogOpen}>
                        <AlertDialogTrigger asChild>
                          <Button type="button" variant="link" className="h-auto p-0 text-xs">
                            Forgot Password?
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Reset Your Password</AlertDialogTitle>
                            <AlertDialogDescription>
                              Enter your email address below, and we'll send you a link to reset your password.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <Form {...forgotPasswordForm}>
                            <form onSubmit={forgotPasswordForm.handleSubmit(handlePasswordReset)}>
                              <FormField
                                control={forgotPasswordForm.control}
                                name="email"
                                render={({ field }) => (
                                  <FormItem>
                                    <Label>Email</Label>
                                    <FormControl>
                                      <div className="relative">
                                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                        <Input type="email" placeholder="you@example.com" className="pl-9" {...field} />
                                      </div>
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                              <AlertDialogFooter className="mt-4">
                                <AlertDialogCancel type="button">Cancel</AlertDialogCancel>
                                <Button type="submit" disabled={resetLoading}>
                                  {resetLoading ? 'Sending...' : 'Send Reset Link'}
                                </Button>
                              </AlertDialogFooter>
                            </form>
                          </Form>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                    <FormControl>
                      <Input type="password" placeholder="••••••••" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full mt-2" disabled={loading || googleLoading}>
                {loading ? 'Signing in...' : 'Sign In'}
              </Button>
            </form>
          </Form>

          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground">Or continue with</span>
            </div>
          </div>

          <Button variant="outline" className="w-full" onClick={handleGoogleLogin} disabled={loading || googleLoading}>
            {googleLoading ? 'Signing in...' : <> <GoogleIcon className="mr-2 h-5 w-5"/> Google </>}
          </Button>

          <div className="mt-4 text-center text-sm">
            Don't have an account?{' '}
            <Link href="/signup" className="underline text-primary hover:text-primary/80">
              Sign up
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
