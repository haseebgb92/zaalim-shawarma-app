"use client";

import Image from "next/image";
import { AppLayout } from "@/components/app-layout";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { DollarSign, CreditCard, Wallet } from "lucide-react";
import { mockSales, mockExpenses, mockInventory, saleVariationsInfo } from "@/lib/data";
import type { Expense, InventoryItem, Sale, SaleVariation } from "@/lib/data";

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

const totalSales = mockSales.reduce((sum, sale) => sum + sale.amount, 0);
const totalExpenses = mockExpenses.reduce((sum, expense) => sum + expense.amount, 0);
const netProfit = totalSales - totalExpenses;

// Process data for charts
const expenseChartData = mockExpenses
  .reduce((acc, expense) => {
    const existing = acc.find(item => item.name === expense.category);
    if (existing) {
      existing.value += expense.amount;
    } else {
      acc.push({ name: expense.category, value: expense.amount });
    }
    return acc;
  }, [] as { name: string; value: number }[])
  .map(item => ({...item, name: item.name.charAt(0).toUpperCase() + item.name.slice(1)}));


const salesByVariationData = mockSales.reduce((acc, sale) => {
    const existing = acc.find(item => item.name === saleVariationsInfo[sale.variation].name);
    if (existing) {
      existing.value += sale.quantity;
    } else {
      acc.push({ name: saleVariationsInfo[sale.variation].name, value: sale.quantity });
    }
    return acc;
}, [] as { name: string; value: number }[]);


const inventoryChartData = mockInventory.map(item => ({
  name: item.name,
  value: item.quantity
}));


const COLORS = ["hsl(var(--chart-1))", "hsl(var(--chart-2))", "hsl(var(--chart-3))", "hsl(var(--chart-4))", "hsl(var(--chart-5))"];

const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="rounded-lg border bg-background p-2 shadow-sm">
          <div className="grid grid-cols-2 gap-2">
            <div className="flex flex-col space-y-1">
              <span className="text-[0.70rem] uppercase text-muted-foreground">
                {payload[0].name}
              </span>
              <span className="font-bold text-muted-foreground">
                {payload[0].value}
              </span>
            </div>
          </div>
        </div>
      );
    }
    return null;
};


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
        
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <Card className="flex flex-col">
                <CardHeader>
                    <CardTitle>Sales by Variation</CardTitle>
                    <CardDescription>Units sold for each product.</CardDescription>
                </CardHeader>
                <CardContent className="flex-1 pb-0">
                    <ResponsiveContainer width="100%" height={250}>
                        <PieChart>
                            <Pie data={salesByVariationData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                                {salesByVariationData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip content={<CustomTooltip />} />
                            <Legend />
                        </PieChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>
            <Card className="flex flex-col">
                <CardHeader>
                    <CardTitle>Expenses by Category</CardTitle>
                    <CardDescription>Breakdown of expenses by category.</CardDescription>
                </CardHeader>
                <CardContent className="flex-1 pb-0">
                    <ResponsiveContainer width="100%" height={250}>
                        <PieChart>
                            <Pie data={expenseChartData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                                {expenseChartData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip formatter={(value: number) => `PKR ${value.toFixed(2)}`} />
                            <Legend />
                        </PieChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>
            <Card className="flex flex-col">
                <CardHeader>
                    <CardTitle>Inventory Breakdown</CardTitle>
                    <CardDescription>Current stock quantity by item.</CardDescription>
                </CardHeader>
                <CardContent className="flex-1 pb-0">
                    <ResponsiveContainer width="100%" height={250}>
                        <PieChart>
                            <Pie data={inventoryChartData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                                {inventoryChartData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip content={<CustomTooltip />} />
                            <Legend />
                        </PieChart>
                    </ResponsiveContainer>
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
