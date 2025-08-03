
'use client';

import * as React from 'react';
import { collection, onSnapshot, query, where, getDocs, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DollarSign, Package, Users, Loader2 } from 'lucide-react';
import AdminOrdersTable from './AdminOrdersTable';
import RevenueChart from './RevenueChart';
import type { Order } from '@/lib/types';

type AnalyticsData = {
    totalRevenue: number;
    totalOrders: number;
    totalCustomers: number;
    revenueByDay: { date: string; revenue: number }[];
};

export default function AdminDashboard() {
    const [analytics, setAnalytics] = React.useState<AnalyticsData | null>(null);
    const [loading, setLoading] = React.useState(true);

    React.useEffect(() => {
        const ordersQuery = query(collection(db, 'orders'));

        const unsubscribe = onSnapshot(ordersQuery, async (snapshot) => {
            const orders: Order[] = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as Order));
            
            const totalRevenue = orders
                .filter(o => o.status === 'Completed')
                .reduce((sum, o) => sum + o.productPrice, 0);

            const totalOrders = orders.length;

            const customerUIDs = new Set(orders.map(o => o.userId));
            const totalCustomers = customerUIDs.size;

            // Calculate revenue for the last 7 days
            const last7Days = Array.from({ length: 7 }, (_, i) => {
                const d = new Date();
                d.setDate(d.getDate() - i);
                return d;
            });

            const revenueByDay = last7Days.map(date => {
                const dayStart = new Date(date.setHours(0, 0, 0, 0));
                const dayEnd = new Date(date.setHours(23, 59, 59, 999));
                
                const dailyRevenue = orders
                    .filter(o => {
                         const orderDate = (o.createdAt as any).toDate();
                         return o.status === 'Completed' && orderDate >= dayStart && orderDate <= dayEnd;
                    })
                    .reduce((sum, o) => sum + o.productPrice, 0);

                return {
                    date: dayStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
                    revenue: dailyRevenue,
                };
            }).reverse();


            setAnalytics({ totalRevenue, totalOrders, totalCustomers, revenueByDay });
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
            <div className="grid gap-4 md:grid-cols-3">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">৳{analytics?.totalRevenue.toFixed(2)}</div>
                    </CardContent>
                </Card>
                 <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
                        <Package className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">+{analytics?.totalOrders}</div>
                    </CardContent>
                </Card>
                 <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Customers</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">+{analytics?.totalCustomers}</div>
                    </CardContent>
                </Card>
            </div>
            
            <RevenueChart data={analytics?.revenueByDay || []} />

            <AdminOrdersTable />
        </div>
    )
}
