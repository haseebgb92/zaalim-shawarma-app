"use client";

import { useState } from "react";
import { AppLayout } from "@/components/app-layout";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Calendar as CalendarIcon, FileDown } from "lucide-react";
import { DateRange } from "react-day-picker";
import { addDays, format } from "date-fns";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

// Mock data fetching, in a real app this would be an API call
import { mockSales, mockExpenses, mockInventory } from "@/lib/data";

export default function ReportsPage() {
  const { toast } = useToast();
  const [date, setDate] = useState<DateRange | undefined>({
    from: new Date(2023, 9, 20),
    to: addDays(new Date(2023, 9, 20), 20),
  });

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
        const val = row[header];
        if (val instanceof Date) {
            return val.toISOString();
        }
        return JSON.stringify(val).replace(/,/g, '');
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
              <Button onClick={() => downloadCSV(mockSales, 'sales_report')}>
                <FileDown className="mr-2 h-4 w-4" />
                Export Sales
              </Button>
              <Button onClick={() => downloadCSV(mockExpenses, 'expenses_report')}>
                <FileDown className="mr-2 h-4 w-4" />
                Export Expenses
              </Button>
              <Button onClick={() => downloadCSV(mockInventory, 'inventory_snapshot')}>
                <FileDown className="mr-2 h-4 w-4" />
                Export Inventory
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
