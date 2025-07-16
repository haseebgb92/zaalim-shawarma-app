"use client";

import { useState, useEffect } from "react";
import { AppLayout } from "@/components/app-layout";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from "@/components/ui/card";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Calendar as CalendarIcon, FileDown } from "lucide-react";
import { DateRange } from "react-day-picker";
import { addDays, format, isWithinInterval } from "date-fns";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { Separator } from "@/components/ui/separator";

import type { Sale, Expense, InventoryItem } from "@/lib/data-types";
import { saleVariationsInfo } from "@/lib/data-types";
import { getSales, getExpenses, getInventory } from "@/lib/data-actions";

export default function ReportsPage() {
  const { toast } = useToast();
  const [date, setDate] = useState<DateRange | undefined>({
    from: new Date(2023, 9, 20),
    to: addDays(new Date(2023, 9, 20), 20),
  });
  
  const [sales, setSales] = useState<Sale[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);

  useEffect(() => {
    getSales().then(setSales);
    getExpenses().then(setExpenses);
    getInventory().then(setInventory);
  }, []);

  const downloadCSV = (data: any[], filename: string) => {
    if (data.length === 0) {
        toast({
            title: "No Data",
            description: `There is no data to export for ${filename}.`,
            variant: "destructive"
        });
        return;
    }
    const headers = Object.keys(data[0]);
    const csvContent = [
      headers.join(','),
      ...data.map(row => headers.map(header => {
        let val = row[header];
        if (val === null || val === undefined) {
          return '';
        }
        if (val instanceof Date) {
            return val.toISOString();
        }
        if (typeof val === 'string') {
          // Escape quotes and wrap in quotes
          val = `"${val.replace(/"/g, '""')}"`;
        }
        return val;
      }).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    if (link.href) {
      URL.revokeObjectURL(link.href);
    }
    const url = URL.createObjectURL(blob);
    link.href = url;
    link.setAttribute('download', `${filename}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast({
        title: "Export Successful",
        description: `${filename}.csv has been downloaded.`,
    })
  };
  
  const downloadCompiledReport = () => {
    const interval = date?.from && date.to ? { start: date.from, end: date.to } : null;

    const filteredSales = interval ? sales.filter(s => isWithinInterval(new Date(s.date), interval)) : sales;
    const filteredExpenses = interval ? expenses.filter(e => isWithinInterval(new Date(e.date), interval)) : expenses;

    const compiledData = [
      ...filteredSales.map(sale => ({
        Date: sale.date,
        Type: "Sale",
        Description: `${sale.quantity} x ${saleVariationsInfo[sale.variation].name}`,
        Category: saleVariationsInfo[sale.variation].name,
        Amount: sale.amount,
        PaymentMethod: sale.type,
      })),
      ...filteredExpenses.map(expense => ({
        Date: expense.date,
        Type: "Expense",
        Description: expense.description,
        Category: expense.category,
        Amount: -expense.amount, // Represent expenses as negative numbers
        PaymentMethod: "N/A",
      })),
    ];

    // Sort by date, most recent first
    const sortedData = compiledData.sort((a, b) => new Date(b.Date).getTime() - new Date(a.Date).getTime());
    
    // Format for CSV
    const csvData = sortedData.map(item => ({
        Date: format(new Date(item.Date), 'yyyy-MM-dd HH:mm:ss'),
        Type: item.Type,
        Description: item.Description,
        Category: item.Category,
        Amount_PKR: item.Amount.toFixed(2),
        Payment_Method: item.PaymentMethod,
    }));
    
    downloadCSV(csvData, 'compiled_report');
  };
  
  const handleDownload = (dataType: 'sales' | 'expenses' | 'inventory') => {
    let data;
    let filename;
    switch (dataType) {
        case 'sales':
            data = sales;
            filename = 'sales_report';
            break;
        case 'expenses':
            data = expenses;
            filename = 'expenses_report';
            break;
        case 'inventory':
            data = inventory;
            filename = 'inventory_snapshot';
            break;
    }
    downloadCSV(data, filename);
  }

  return (
    <AppLayout>
      <div className="flex flex-col gap-6">
        <h1 className="font-headline text-3xl font-bold">Reports</h1>
        <Card>
          <CardHeader>
            <CardTitle>Export Data</CardTitle>
            <CardDescription>Download your business data as CSV files for a selected time period.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium">Select Date Range</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "w-full justify-start text-left font-normal mt-1",
                      !date && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {date?.from ? (
                      date.to ? (
                        <>
                          {format(date.from, "LLL dd, y")} -{" "}
                          {format(date.to, "LLL dd, y")}
                        </>
                      ) : (
                        format(date.from, "LLL dd, y")
                      )
                    ) : (
                      <span>Pick a date</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    initialFocus
                    mode="range"
                    defaultMonth={date?.from}
                    selected={date}
                    onSelect={setDate}
                    numberOfMonths={2}
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              <Button onClick={() => handleDownload('sales')}>
                <FileDown className="mr-2 h-4 w-4" />
                Export Sales
              </Button>
              <Button onClick={() => handleDownload('expenses')}>
                <FileDown className="mr-2 h-4 w-4" />
                Export Expenses
              </Button>
              <Button onClick={() => handleDownload('inventory')}>
                <FileDown className="mr-2 h-4 w-4" />
                Export Inventory
              </Button>
            </div>
          </CardContent>
          <CardFooter className="flex-col items-start gap-4">
             <Separator />
             <Button onClick={downloadCompiledReport} variant="secondary" className="w-full sm:w-auto">
                <FileDown className="mr-2 h-4 w-4" />
                Export Compiled Report
              </Button>
          </CardFooter>
        </Card>
      </div>
    </AppLayout>
  );
}
