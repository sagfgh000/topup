
'use client';

import * as React from 'react';
import { collection, onSnapshot, query, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DollarSign, Loader2, TrendingUp, Calendar, Globe } from 'lucide-react';
import AdminOrdersTable from './AdminOrdersTable';
import RevenueChart from './RevenueChart';
import type { Order } from '@/lib/types';

type AnalyticsData = {
    totalRevenue: number;
    todayRevenue: number;
    last7DaysRevenue: number;
    last30DaysRevenue: number;
    revenueByDay: { date: string; revenue: number }[];
};

export default function AdminDashboard() {
    const [analytics, setAnalytics] = React.useState<AnalyticsData | null>(null);
    const [loading, setLoading] = React.useState(true);

    React.useEffect(() => {
        const ordersQuery = query(collection(db, 'orders'));

        const unsubscribe = onSnapshot(ordersQuery, (snapshot) => {
            const now = new Date();
            const today = new Date(now.setHours(0, 0, 0, 0));
            const sevenDaysAgo = new Date(new Date().setDate(today.getDate() - 7));
            const thirtyDaysAgo = new Date(new Date().setDate(today.getDate() - 30));

            let totalRevenue = 0;
            let todayRevenue = 0;
            let last7DaysRevenue = 0;
            let last30DaysRevenue = 0;

            const orders: Order[] = snapshot.docs.map(doc => {
                 const data = doc.data();
                 const orderDate = (data.createdAt as Timestamp)?.toDate() || new Date();

                 if (data.status === 'Completed') {
                     totalRevenue += data.productPrice;
                     if (orderDate >= today) {
                         todayRevenue += data.productPrice;
                     }
                      if (orderDate >= sevenDaysAgo) {
                         last7DaysRevenue += data.productPrice;
                     }
                      if (orderDate >= thirtyDaysAgo) {
                         last30DaysRevenue += data.productPrice;
                     }
                 }

                 return { 
                    ...data, 
                    id: doc.id,
                    createdAt: orderDate,
                } as Order
            });

            // Calculate revenue for the last 7 days chart
            const last7DaysChart = Array.from({ length: 7 }, (_, i) => {
                const d = new Date();
                d.setDate(d.getDate() - i);
                return d;
            });

            const revenueByDay = last7DaysChart.map(date => {
                const dayStart = new Date(date.setHours(0, 0, 0, 0));
                const dayEnd = new Date(new Date(dayStart).setHours(23, 59, 59, 999));
                
                const dailyRevenue = orders
                    .filter(o => {
                         const orderDate = o.createdAt;
                         return o.status === 'Completed' && orderDate >= dayStart && orderDate <= dayEnd;
                    })
                    .reduce((sum, o) => sum + o.productPrice, 0);

                return {
                    date: dayStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
                    revenue: dailyRevenue,
                };
            }).reverse();


            setAnalytics({ totalRevenue, todayRevenue, last7DaysRevenue, last30DaysRevenue, revenueByDay });
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="space-y-8">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Today's Revenue</CardTitle>
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">৳{analytics?.todayRevenue.toFixed(2)}</div>
                    </CardContent>
                </Card>
                 <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Last 7 Days</CardTitle>
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">৳{analytics?.last7DaysRevenue.toFixed(2)}</div>
                    </CardContent>
                </Card>
                 <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Last 30 Days</CardTitle>
                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">৳{analytics?.last30DaysRevenue.toFixed(2)}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                        <Globe className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">৳{analytics?.totalRevenue.toFixed(2)}</div>
                    </CardContent>
                </Card>
            </div>
            
            <RevenueChart data={analytics?.revenueByDay || []} />

            <AdminOrdersTable />
        </div>
    )
}
