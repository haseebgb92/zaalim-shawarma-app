"use client";

import { useState } from "react";
import { AppLayout } from "@/components/app-layout";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { mockInventory, type InventoryItem } from "@/lib/data";
import { format } from "date-fns";
import { PlusCircle, MinusCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

const inventoryActionSchema = z.object({
  name: z.string().min(1, "Ingredient name is required."),
  quantity: z.coerce.number().positive("Quantity must be a positive number."),
  unit: z.enum(["kg", "g", "l", "ml", "pcs"]),
});

const usageActionSchema = z.object({
    id: z.string().min(1, "Please select an ingredient."),
    quantity: z.coerce.number().positive("Quantity must be a positive number."),
});

export default function InventoryPage() {
  const [inventory, setInventory] = useState<InventoryItem[]>(mockInventory);
  const [isPurchaseDialogOpen, setIsPurchaseDialogOpen] = useState(false);
  const [isUsageDialogOpen, setIsUsageDialogOpen] = useState(false);
  const { toast } = useToast();

  const purchaseForm = useForm<z.infer<typeof inventoryActionSchema>>({
    resolver: zodResolver(inventoryActionSchema),
    defaultValues: { name: "", quantity: 0, unit: "kg" },
  });

  const usageForm = useForm<z.infer<typeof usageActionSchema>>({
    resolver: zodResolver(usageActionSchema),
  });

  const getBadgeVariant = (quantity: number, unit: string) => {
    const lowStockThreshold = unit === 'pcs' ? 20 : 10;
    if (quantity < lowStockThreshold) return "destructive";
    if (quantity < lowStockThreshold * 2.5) return "secondary";
    return "default";
  };
  
  const getBadgeText = (quantity: number, unit: string) => {
    const lowStockThreshold = unit === 'pcs' ? 20 : 10;
    if (quantity === 0) return "Out of Stock";
    if (quantity < lowStockThreshold) return "Low Stock";
    return "In Stock";
  }

  function onPurchaseSubmit(values: z.infer<typeof inventoryActionSchema>) {
    setInventory(prevInventory => {
      const existingItemIndex = prevInventory.findIndex(
        item => item.name.toLowerCase() === values.name.toLowerCase() && item.unit === values.unit
      );

      if (existingItemIndex > -1) {
        // Update existing item
        const updatedInventory = [...prevInventory];
        const existingItem = updatedInventory[existingItemIndex];
        updatedInventory[existingItemIndex] = {
          ...existingItem,
          quantity: existingItem.quantity + values.quantity,
          lastUpdated: new Date(),
        };
        return updatedInventory;
      } else {
        // Add new item
        const newItem: InventoryItem = {
          id: (prevInventory.length + 1).toString(),
          name: values.name,
          quantity: values.quantity,
          unit: values.unit,
          lastUpdated: new Date(),
        };
        return [newItem, ...prevInventory];
      }
    });

    toast({
      title: "Purchase Recorded",
      description: `Added ${values.quantity} ${values.unit} of ${values.name}.`,
    });
    purchaseForm.reset({ name: "", quantity: 0, unit: "kg" });
    setIsPurchaseDialogOpen(false);
  }

  function onUsageSubmit(values: z.infer<typeof usageActionSchema>) {
    setInventory(prevInventory => {
      const itemIndex = prevInventory.findIndex(item => item.id === values.id);
      if (itemIndex === -1) {
        toast({ variant: "destructive", title: "Error", description: "Item not found." });
        return prevInventory;
      }

      const updatedInventory = [...prevInventory];
      const item = updatedInventory[itemIndex];

      if (item.quantity < values.quantity) {
        toast({ variant: "destructive", title: "Insufficient Stock", description: `Cannot use ${values.quantity} ${item.unit} of ${item.name}. Only ${item.quantity} ${item.unit} available.` });
        return prevInventory;
      }
      
      updatedInventory[itemIndex] = {
        ...item,
        quantity: item.quantity - values.quantity,
        lastUpdated: new Date(),
      };

      toast({
        title: "Usage Recorded",
        description: `Used ${values.quantity} ${item.unit} of ${item.name}.`,
      });

      usageForm.reset();
      setIsUsageDialogOpen(false);
      return updatedInventory;
    });
  }

  return (
    <AppLayout>
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <h1 className="font-headline text-3xl font-bold">Inventory</h1>
          <div className="flex gap-2">
            <Dialog open={isPurchaseDialogOpen} onOpenChange={setIsPurchaseDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline">
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Add Purchase
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader><DialogTitle>Add Purchase / New Ingredient</DialogTitle></DialogHeader>
                <Form {...purchaseForm}>
                  <form onSubmit={purchaseForm.handleSubmit(onPurchaseSubmit)} className="space-y-4">
                    <FormField control={purchaseForm.control} name="name" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Ingredient Name</FormLabel>
                        <FormControl><Input {...field} placeholder="e.g. Chicken" /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <div className="grid grid-cols-2 gap-4">
                      <FormField control={purchaseForm.control} name="quantity" render={({ field }) => (
                        <FormItem>
                          <FormLabel>Quantity</FormLabel>
                          <FormControl><Input type="number" {...field} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />
                      <FormField control={purchaseForm.control} name="unit" render={({ field }) => (
                        <FormItem>
                          <FormLabel>Unit</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                            <SelectContent>
                              <SelectItem value="kg">kg</SelectItem>
                              <SelectItem value="g">g</SelectItem>
                              <SelectItem value="l">l</SelectItem>
                              <SelectItem value="ml">ml</SelectItem>
                              <SelectItem value="pcs">pcs</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )} />
                    </div>
                    <Button type="submit" className="w-full">Add to Inventory</Button>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>

            <Dialog open={isUsageDialogOpen} onOpenChange={setIsUsageDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline">
                  <MinusCircle className="mr-2 h-4 w-4" />
                  Record Usage
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader><DialogTitle>Record Ingredient Usage</DialogTitle></DialogHeader>
                <Form {...usageForm}>
                  <form onSubmit={usageForm.handleSubmit(onUsageSubmit)} className="space-y-4">
                    <FormField control={usageForm.control} name="id" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Ingredient</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl><SelectTrigger><SelectValue placeholder="Select an ingredient" /></SelectTrigger></FormControl>
                          <SelectContent>
                            {inventory.map(item => (
                              <SelectItem key={item.id} value={item.id}>
                                {item.name} ({item.quantity} {item.unit})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormField control={usageForm.control} name="quantity" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Quantity Used</FormLabel>
                        <FormControl><Input type="number" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <Button type="submit" className="w-full">Record Usage</Button>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </div>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Current Inventory</CardTitle>
            <CardDescription>An overview of your current ingredient stock levels.</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Ingredient</TableHead>
                  <TableHead>Quantity</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Last Updated</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {inventory.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">{item.name}</TableCell>
                    <TableCell>{`${item.quantity} ${item.unit}`}</TableCell>
                    <TableCell>
                      <Badge variant={getBadgeVariant(item.quantity, item.unit)}>
                        {getBadgeText(item.quantity, item.unit)}
                      </Badge>
                    </TableCell>
                    <TableCell>{format(new Date(item.lastUpdated), "PPP p")}</TableCell>
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
