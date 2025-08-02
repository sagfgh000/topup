
import Header from "@/components/Header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ListCollapse } from "lucide-react";
import TransactionHistoryClient from "./TransactionHistoryClient";


export default function TransactionsPage() {
  return (
    <>
      <Header />
      <main className="container mx-auto px-4 py-8 md:py-12">
        <Card className="max-w-4xl mx-auto shadow-lg">
          <CardHeader>
            <CardTitle className="font-headline text-2xl md:text-3xl flex items-center gap-3">
              <ListCollapse className="h-8 w-8 text-primary" />
              Transaction History
            </CardTitle>
            <CardDescription>
              A log of all your wallet top-ups and order payments.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <TransactionHistoryClient />
          </CardContent>
        </Card>
      </main>
    </>
  );
}
