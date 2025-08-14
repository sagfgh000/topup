
import Header from "@/components/Header";
import OrderHistory from "@/components/OrderHistory";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Search } from "lucide-react";
import { type Metadata } from "next";

export const metadata: Metadata = {
  title: 'Track Your Order - Diamond Depot',
  description: 'Check the status of your Free Fire diamond top-up order. Enter your Player ID (UID) to view your complete order history and current status.',
};

export default function OrderTrackingPage() {
  return (
    <>
      <Header />
      <main className="container mx-auto px-4 py-8 md:py-12">
        <Card className="max-w-4xl mx-auto shadow-lg">
          <CardHeader>
            <CardTitle className="font-headline text-2xl md:text-3xl flex items-center gap-3">
              <Search className="h-8 w-8 text-primary" />
              Track Your Order
            </CardTitle>
            <CardDescription>
              Enter your Free Fire Player ID (UID) to see your order history and status.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <OrderHistory />
          </CardContent>
        </Card>
      </main>
    </>
  );
}
