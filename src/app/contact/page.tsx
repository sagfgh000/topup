
import Header from "@/components/Header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Phone, UserPlus, Wallet, Gem, CheckCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { type Metadata } from "next";

export const metadata: Metadata = {
  title: 'How It Works & Contact Us - Rmr Topup',
  description: 'Learn the simple steps to top-up your Free Fire diamonds and how to contact us for support. We are available to help you with any issues.',
};

const Step = ({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) => (
    <div className="flex items-start gap-4">
        <div className="flex-shrink-0">{icon}</div>
        <div>
            <h3 className="text-lg font-semibold">{title}</h3>
            <p className="text-muted-foreground">{description}</p>
        </div>
    </div>
);


export default function ContactPage() {
  return (
    <>
      <Header />
      <main className="container mx-auto px-4 py-8 md:py-12">
        <Card className="max-w-4xl mx-auto shadow-lg">
          <CardHeader>
            <CardTitle className="font-headline text-2xl md:text-3xl flex items-center gap-3">
              <Phone className="h-8 w-8 text-primary" />
              How It Works & Contact Us
            </CardTitle>
            <CardDescription>
              Follow these simple steps to top-up your account and get in touch if you need help.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-8">
            <div className="space-y-6">
                <Step 
                    icon={<UserPlus className="h-8 w-8 text-primary" />}
                    title="Step 1: Create an Account or Log In"
                    description="First, you need to sign up for an account or log in if you already have one. This allows you to manage your wallet and view your order history."
                />
                 <Step 
                    icon={<Wallet className="h-8 w-8 text-primary" />}
                    title="Step 2: Add Money to Your Wallet"
                    description="From your dashboard, click 'Add Money'. Choose a payment method (bKash or Nagad), send the desired amount to the provided number, and submit the form with your transaction ID."
                />
                 <Step 
                    icon={<Gem className="h-8 w-8 text-primary" />}
                    title="Step 3: Place Your Order"
                    description="Go to the homepage, select the diamond package you want to purchase, enter your Free Fire Player ID (UID), and click 'Submit Order'. The cost will be deducted from your wallet balance."
                />
                <Step 
                    icon={<CheckCircle className="h-8 w-8 text-primary" />}
                    title="Step 4: Order Confirmation"
                    description="Our team will process your request. You can check the status of your order in the 'Dashboard' under 'Recent Orders' or on the 'Order History' page."
                />
            </div>
            
            <Separator />

            <Alert className="bg-primary/10 border-primary/20">
                <Phone className="h-5 w-5 text-primary" />
                <AlertTitle className="font-bold text-primary">Need Assistance?</AlertTitle>
                <AlertDescription className="text-foreground">
                    If you have any questions or face any issues, please do not hesitate to contact us directly.
                    <div className="my-4 text-center">
                        <a href="tel:01845938953" className="inline-block px-8 py-3 rounded-full bg-primary text-primary-foreground font-bold text-xl tracking-wider hover:bg-primary/90 transition-colors">
                            01845938953
                        </a>
                    </div>
                </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      </main>
    </>
  );
}
