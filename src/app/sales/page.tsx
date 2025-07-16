"use client";

import { useState, useEffect } from "react";
import { AppLayout } from "@/components/app-layout";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PlusCircle, Pencil } from "lucide-react";
import { mockSales, type Sale, saleVariationsInfo, type SaleVariation } from "@/lib/data";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";

const saleSchema = z.object({
  variation: z.enum(Object.keys(saleVariationsInfo) as [keyof typeof saleVariationsInfo]),
  quantity: z.coerce.number().int().min(1, "Quantity must be at least 1."),
  type: z.enum(["cash", "easypaisa", "jazzcash"]),
});

const priceSchema = z.object({
  small: z.coerce.number().min(0, "Price must be non-negative."),
  medium: z.coerce.number().min(0, "Price must be non-negative."),
  large: z.coerce.number().min(0, "Price must be non-negative."),
  "bun-burger": z.coerce.number().min(0, "Price must be non-negative."),
});

export default function SalesPage() {
  const [sales, setSales] = useState<Sale[]>(mockSales);
  const [isSaleDialogOpen, setIsSaleDialogOpen] = useState(false);
  const [isPriceDialogOpen, setIsPriceDialogOpen] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const { toast } = useToast();

  const [saleVariations, setSaleVariations] = useState(() => {
    const initialVariations: Record<string, { name: string; price: number }> = {};
    for (const key in saleVariationsInfo) {
      const typedKey = key as SaleVariation;
      initialVariations[key] = {
        name: saleVariationsInfo[typedKey].name,
        price: saleVariationsInfo[typedKey].defaultPrice,
      };
    }
    return initialVariations;
  });

  useEffect(() => {
    setIsClient(true);
  }, []);

  const saleForm = useForm<z.infer<typeof saleSchema>>({
    resolver: zodResolver(saleSchema),
    defaultValues: {
      variation: "medium",
      quantity: 1,
      type: "easypaisa",
    },
  });

  const priceForm = useForm<z.infer<typeof priceSchema>>({
    resolver: zodResolver(priceSchema),
    defaultValues: {
      small: saleVariations.small.price,
      medium: saleVariations.medium.price,
      large: saleVariations.large.price,
      "bun-burger": saleVariations["bun-burger"].price,
    },
  });
  
  useEffect(() => {
    priceForm.reset({
      small: saleVariations.small.price,
      medium: saleVariations.medium.price,
      large: saleVariations.large.price,
      "bun-burger": saleVariations["bun-burger"].price,
    });
  }, [saleVariations, priceForm]);


  function onSaleSubmit(values: z.infer<typeof saleSchema>) {
    const variationDetails = saleVariations[values.variation];
    const newSale: Sale = {
      id: (sales.length + 1).toString(),
      date: new Date(),
      variation: values.variation,
      quantity: values.quantity,
      amount: variationDetails.price * values.quantity,
      type: values.type,
    };
    setSales(prevSales => [newSale, ...prevSales]);
    saleForm.reset();
    setIsSaleDialogOpen(false);
    toast({
        title: "Sale Logged",
        description: `${values.quantity} x ${variationDetails.name} sale recorded for PKR ${newSale.amount.toFixed(2)}.`,
    });
  }

  function onPriceSubmit(values: z.infer<typeof priceSchema>) {
    setSaleVariations(prev => ({
        ...prev,
        small: { ...prev.small, price: values.small },
        medium: { ...prev.medium, price: values.medium },
        large: { ...prev.large, price: values.large },
        "bun-burger": { ...prev["bun-burger"], price: values["bun-burger"] }
    }));
    setIsPriceDialogOpen(false);
    toast({
      title: "Prices Updated",
      description: "Product prices have been successfully updated.",
    });
  }
  
  const salesByVariation = sales.reduce((acc, sale) => {
    if (!acc[sale.variation]) {
      acc[sale.variation] = { totalAmount: 0, quantity: 0 };
    }
    acc[sale.variation].totalAmount += sale.amount;
    acc[sale.variation].quantity += sale.quantity;
    return acc;
  }, {} as Record<SaleVariation, { totalAmount: number; quantity: number }>);

  return (
    <AppLayout>
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <h1 className="font-headline text-3xl font-bold">Sales</h1>
          <div className="flex gap-2">
            <Dialog open={isPriceDialogOpen} onOpenChange={setIsPriceDialogOpen}>
                <DialogTrigger asChild>
                    <Button variant="outline">
                        <Pencil className="mr-2 h-4 w-4" />
                        Edit Prices
                    </Button>
                </DialogTrigger>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Edit Product Prices</DialogTitle>
                    </DialogHeader>
                    <Form {...priceForm}>
                        <form onSubmit={priceForm.handleSubmit(onPriceSubmit)} className="space-y-4">
                            {Object.entries(saleVariations).map(([key, { name }]) => (
                                <FormField
                                    key={key}
                                    control={priceForm.control}
                                    name={key as keyof z.infer<typeof priceSchema>}
                                    render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>{name} (PKR)</FormLabel>
                                        <FormControl>
                                        <Input type="number" step="0.01" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                    )}
                                />
                            ))}
                            <Button type="submit" className="w-full">Save Prices</Button>
                        </form>
                    </Form>
                </DialogContent>
            </Dialog>
            <Dialog open={isSaleDialogOpen} onOpenChange={setIsSaleDialogOpen}>
                <DialogTrigger asChild>
                <Button>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Log Sale
                </Button>
                </DialogTrigger>
                <DialogContent>
                <DialogHeader>
                    <DialogTitle>Log a New Sale</DialogTitle>
                </DialogHeader>
                <Form {...saleForm}>
                    <form onSubmit={saleForm.handleSubmit(onSaleSubmit)} className="space-y-4">
                    <FormField
                        control={saleForm.control}
                        name="variation"
                        render={({ field }) => (
                        <FormItem>
                            <FormLabel>Product</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                                <SelectTrigger>
                                <SelectValue placeholder="Select a product" />
                                </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                                {Object.entries(saleVariations).map(([key, {name}]) => (
                                    <SelectItem key={key} value={key}>{name} (PKR {saleVariations[key as SaleVariation].price.toFixed(2)})</SelectItem>
                                ))}
                            </SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                        )}
                    />
                    <FormField
                        control={saleForm.control}
                        name="quantity"
                        render={({ field }) => (
                        <FormItem>
                            <FormLabel>Quantity</FormLabel>
                            <FormControl>
                            <Input type="number" {...field} placeholder="e.g. 1" />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                        )}
                    />
                    <FormField
                        control={saleForm.control}
                        name="type"
                        render={({ field }) => (
                        <FormItem>
                            <FormLabel>Payment Type</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                                <SelectTrigger>
                                <SelectValue placeholder="Select payment type" />
                                </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                                <SelectItem value="cash">Cash</SelectItem>
                                <SelectItem value="easypaisa">Easypaisa</SelectItem>
                                <SelectItem value="jazzcash">Jazzcash</SelectItem>
                            </SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                        )}
                    />
                    <Button type="submit" className="w-full">Log Sale</Button>
                    </form>
                </Form>
                </DialogContent>
            </Dialog>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Sales by Variation</CardTitle>
            <CardDescription>Total sales for each product variation.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            {Object.entries(saleVariations).map(([key, {name}]) => {
              const data = salesByVariation[key as SaleVariation];
              return (
                <div key={key} className="flex items-center justify-between rounded-lg border p-3">
                  <div>
                    <p className="font-medium">{name}</p>
                    <p className="text-sm text-muted-foreground">{data ? data.quantity : 0} units sold</p>
                  </div>
                  <p className="text-lg font-semibold">PKR {data ? data.totalAmount.toFixed(2) : '0.00'}</p>
                </div>
              );
            })}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Sales</CardTitle>
            <CardDescription>A list of your recent sales transactions.</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Product</TableHead>
                  <TableHead className="text-right">Quantity</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sales.map((sale) => (
                  <TableRow key={sale.id}>
                    <TableCell>{isClient ? format(sale.date, "PPP p") : ''}</TableCell>
                    <TableCell className="font-medium">{saleVariations[sale.variation].name}</TableCell>
                    <TableCell className="text-right">{sale.quantity}</TableCell>
                    <TableCell className="capitalize">{sale.type}</TableCell>
                    <TableCell className="text-right font-medium">PKR {sale.amount.toFixed(2)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
