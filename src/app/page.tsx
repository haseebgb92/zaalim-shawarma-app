"use client";

import Image from "next/image";
import { AppLayout } from "@/components/app-layout";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { DollarSign, CreditCard, Wallet } from "lucide-react";

// Mock data
const salesData = [
  { name: 'Mon', sales: 4000, expenses: 2400 },
  { name: 'Tue', sales: 3000, expenses: 1398 },
  { name: 'Wed', sales: 2000, expenses: 9800 },
  { name: 'Thu', sales: 2780, expenses: 3908 },
  { name: 'Fri', sales: 1890, expenses: 4800 },
  { name: 'Sat', sales: 2390, expenses: 3800 },
  { name: 'Sun', sales: 3490, expenses: 4300 },
];

const totalSales = 5600.50;
const totalExpenses = 2345.20;
const netProfit = totalSales - totalExpenses;

export default function DashboardPage() {
  return (
    <AppLayout>
      <div className="flex flex-col gap-6">
        <div className="mb-6 overflow-hidden rounded-lg shadow-md hidden md:block">
            <Image
            src="/zaalim-banner.png"
            alt="Zaalimmm! Shawarma Banner"
            width={1600}
            height={350}
            className="w-full object-cover"
            priority
            data-ai-hint="shawarma banner"
            />
        </div>
        <h1 className="font-headline text-3xl font-bold">Dashboard</h1>
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Sales</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">PKR {totalSales.toFixed(2)}</div>
              <p className="text-xs text-muted-foreground">+20.1% from last month</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
              <CreditCard className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">PKR {totalExpenses.toFixed(2)}</div>
              <p className="text-xs text-muted-foreground">+12.2% from last month</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Net Profit</CardTitle>
              <Wallet className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">PKR {netProfit.toFixed(2)}</div>
              <p className="text-xs text-muted-foreground">+35.3% from last month</p>
            </CardContent>
          </Card>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Sales & Expenses Overview</CardTitle>
            <CardDescription>Weekly performance summary.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[350px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={salesData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `PKR${value}`} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--background))",
                      borderColor: "hsl(var(--border))",
                      borderRadius: "var(--radius)",
                    }}
                    formatter={(value: number) => `PKR ${value.toFixed(2)}`}
                  />
                  <Legend iconSize={10} />
                  <Bar dataKey="sales" fill="hsl(var(--primary))" name="Sales" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="expenses" fill="hsl(var(--accent))" name="Expenses" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
