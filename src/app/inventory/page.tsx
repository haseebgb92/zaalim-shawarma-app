"use client";

import { useState, useEffect } from "react";
import { AppLayout } from "@/components/app-layout";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useForm, useWatch } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { mockInventory, mockInventoryTransactions, type InventoryItem, type InventoryTransaction, mockExpenses, type Expense } from "@/lib/data";
import { format } from "date-fns";
import { PlusCircle, MinusCircle, Pencil, History } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

const purchaseSchema = z.object({
  name: z.string().min(1, "Ingredient name is required."),
  quantity: z.coerce.number().positive("Quantity must be a positive number."),
  unit: z.enum(["kg", "g", "l", "ml", "pcs"]),
  cost: z.coerce.number().min(0, "Cost must be a non-negative number.").optional(),
});

const usageSchema = z.object({
  id: z.string().min(1, "Please select an ingredient."),
  quantity: z.coerce.number().positive("Quantity must be a positive number."),
});

const editTransactionSchema = z.object({
    name: z.string().min(1, "Ingredient name is required."),
    quantity: z.coerce.number().positive("Quantity must be a positive number."),
    unit: z.enum(["kg", "g", "l", "ml", "pcs"]),
    cost: z.coerce.number().min(0, "Cost must be a non-negative number.").optional(),
    type: z.enum(['purchase', 'usage'])
});

export default function InventoryPage() {
  const [inventory, setInventory] = useState<InventoryItem[]>(mockInventory);
  const [transactions, setTransactions] = useState<InventoryTransaction[]>(mockInventoryTransactions);
  const [isPurchaseDialogOpen, setIsPurchaseDialogOpen] = useState(false);
  const [isUsageDialogOpen, setIsUsageDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<InventoryTransaction | null>(null);

  const [isClient, setIsClient] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    setIsClient(true);
  }, []);

  const purchaseForm = useForm<z.infer<typeof purchaseSchema>>({
    resolver: zodResolver(purchaseSchema),
    defaultValues: { name: "", quantity: 0, unit: "kg", cost: 0 },
  });

  const usageForm = useForm<z.infer<typeof usageSchema>>({
    resolver: zodResolver(usageSchema),
  });
  
  const editForm = useForm<z.infer<typeof editTransactionSchema>>({
      resolver: zodResolver(editTransactionSchema),
      defaultValues: {
        name: "",
        quantity: 0,
        unit: "kg",
        cost: 0,
        type: "purchase",
      }
  });

  useEffect(() => {
    if (editingTransaction) {
      editForm.reset({
          name: editingTransaction.name,
          quantity: editingTransaction.quantity,
          unit: editingTransaction.unit,
          cost: editingTransaction.cost || 0,
          type: editingTransaction.type
      });
      setIsEditDialogOpen(true);
    } else {
      setIsEditDialogOpen(false);
    }
  }, [editingTransaction, editForm]);


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

  const onPurchaseSubmit = (values: z.infer<typeof purchaseSchema>) => {
    const newTransaction: InventoryTransaction = {
      id: `p${transactions.length + 1}`,
      date: new Date(),
      type: 'purchase',
      ...values,
    };
    setTransactions(prev => [newTransaction, ...prev]);
    
    setInventory(prev => {
        const existingItem = prev.find(item => item.name.toLowerCase() === values.name.toLowerCase() && item.unit === values.unit);
        if (existingItem) {
            return prev.map(item => item.id === existingItem.id ? {...item, quantity: item.quantity + values.quantity, lastUpdated: new Date()} : item);
        }
        return [...prev, {id: (prev.length+1).toString(), name: values.name, quantity: values.quantity, unit: values.unit, lastUpdated: new Date()}];
    });

    if (values.cost && values.cost > 0) {
        const newExpense: Expense = {
            id: `e${mockExpenses.length + 1}`,
            date: new Date(),
            amount: values.cost,
            category: 'supplies',
            description: `Purchase: ${values.quantity} ${values.unit} of ${values.name}`
        };
        mockExpenses.unshift(newExpense);
    }

    toast({ title: "Purchase Recorded", description: `Added ${values.quantity} ${values.unit} of ${values.name}.` });
    purchaseForm.reset({ name: "", quantity: 0, unit: "kg", cost: 0 });
    setIsPurchaseDialogOpen(false);
  }

  const onUsageSubmit = (values: z.infer<typeof usageSchema>) => {
    const itemToUpdate = inventory.find(item => item.id === values.id);
    if (!itemToUpdate) {
        toast({ variant: "destructive", title: "Error", description: "Item not found." });
        return;
    }
    if (itemToUpdate.quantity < values.quantity) {
        toast({ variant: "destructive", title: "Insufficient Stock", description: `Cannot use ${values.quantity} ${itemToUpdate.unit} of ${itemToUpdate.name}. Only ${itemToUpdate.quantity} ${itemToUpdate.unit} available.` });
        return;
    }
    const newTransaction: InventoryTransaction = {
        id: `u${transactions.length + 1}`,
        date: new Date(),
        type: 'usage',
        name: itemToUpdate.name,
        quantity: values.quantity,
        unit: itemToUpdate.unit
    };
    setTransactions(prev => [newTransaction, ...prev]);

    setInventory(prev => prev.map(item => item.id === values.id ? {...item, quantity: item.quantity - values.quantity, lastUpdated: new Date()} : item));

    toast({ title: "Usage Recorded", description: `Used ${values.quantity} ${itemToUpdate.unit} of ${itemToUpdate.name}.` });
    usageForm.reset();
    setIsUsageDialogOpen(false);
  }

  const onEditSubmit = (values: z.infer<typeof editTransactionSchema>) => {
    if (!editingTransaction) return;

    const updatedTransaction: InventoryTransaction = {
        ...editingTransaction,
        ...values,
        cost: values.type === 'purchase' ? values.cost : undefined,
        editHistory: [
            ...(editingTransaction.editHistory || []),
            {
                editedAt: new Date(),
                originalValues: {
                    type: editingTransaction.type,
                    name: editingTransaction.name,
                    quantity: editingTransaction.quantity,
                    unit: editingTransaction.unit,
                    cost: editingTransaction.cost,
                }
            }
        ]
    };
    
    setTransactions(prev => prev.map(t => t.id === editingTransaction.id ? updatedTransaction : t));
    setEditingTransaction(null);
    setIsEditDialogOpen(false);

    toast({
        title: "Transaction Updated",
        description: `Transaction ID ${editingTransaction.id} has been updated. Please check current inventory levels.`,
    });
  };

  const purchases = transactions.filter(t => t.type === 'purchase');
  const usages = transactions.filter(t => t.type === 'usage');
  
  const EditFormCostField = () => {
    const type = useWatch({ control: editForm.control, name: "type" });

    if (type !== 'purchase') return null;

    return (
        <FormField control={editForm.control} name="cost" render={({ field }) => (
            <FormItem><FormLabel>Total Cost (PKR)</FormLabel><FormControl><Input type="number" {...field} value={field.value || 0} /></FormControl><FormMessage /></FormItem>
        )} />
    );
  };


  return (
    <AppLayout>
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <h1 className="font-headline text-3xl font-bold">Inventory</h1>
          <div className="flex gap-2">
            <Dialog open={isPurchaseDialogOpen} onOpenChange={setIsPurchaseDialogOpen}>
              <DialogTrigger asChild><Button><PlusCircle className="mr-2 h-4 w-4" />Add Purchase</Button></DialogTrigger>
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
                    <FormField control={purchaseForm.control} name="cost" render={({ field }) => (
                        <FormItem>
                          <FormLabel>Total Cost (PKR)</FormLabel>
                          <FormControl><Input type="number" {...field} placeholder="e.g. 5000" /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />
                    <Button type="submit" className="w-full">Add to Inventory</Button>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>

            <Dialog open={isUsageDialogOpen} onOpenChange={setIsUsageDialogOpen}>
              <DialogTrigger asChild><Button variant="outline"><MinusCircle className="mr-2 h-4 w-4" />Record Usage</Button></DialogTrigger>
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
                            {inventory.filter(i => i.quantity > 0).map(item => (
                              <SelectItem key={item.id} value={item.id}>
                                {item.name} ({item.quantity.toFixed(2)} {item.unit})
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

        <Dialog open={isEditDialogOpen} onOpenChange={(open) => !open && setEditingTransaction(null)}>
            <DialogContent>
                <DialogHeader><DialogTitle>Edit Transaction (ID: {editingTransaction?.id})</DialogTitle></DialogHeader>
                <Form {...editForm}>
                    <form onSubmit={editForm.handleSubmit(onEditSubmit)} className="space-y-4">
                       <FormField control={editForm.control} name="name" render={({ field }) => (
                          <FormItem><FormLabel>Ingredient Name</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                        <div className="grid grid-cols-2 gap-4">
                            <FormField control={editForm.control} name="quantity" render={({ field }) => (
                                <FormItem><FormLabel>Quantity</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
                            )} />
                            <FormField control={editForm.control} name="unit" render={({ field }) => (
                                <FormItem><FormLabel>Unit</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl><SelectTrigger><SelectValue/></SelectTrigger></FormControl>
                                        <SelectContent>
                                            <SelectItem value="kg">kg</SelectItem><SelectItem value="g">g</SelectItem><SelectItem value="l">l</SelectItem><SelectItem value="ml">ml</SelectItem><SelectItem value="pcs">pcs</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <FormMessage/>
                                </FormItem>
                            )} />
                        </div>
                        <EditFormCostField />
                        <Button type="submit" className="w-full">Save Changes</Button>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>

        <Card>
          <CardHeader>
            <CardTitle>Current Stock Levels</CardTitle>
            <CardDescription>An overview of your current ingredient stock.</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader><TableRow><TableHead>Ingredient</TableHead><TableHead>Quantity</TableHead><TableHead>Status</TableHead><TableHead>Last Updated</TableHead></TableRow></TableHeader>
              <TableBody>
                {inventory.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">{item.name}</TableCell>
                    <TableCell>{`${item.quantity.toFixed(2)} ${item.unit}`}</TableCell>
                    <TableCell><Badge variant={getBadgeVariant(item.quantity, item.unit)}>{getBadgeText(item.quantity, item.unit)}</Badge></TableCell>
                    <TableCell>{isClient ? format(new Date(item.lastUpdated), "PPP p") : ''}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
        
        <Tabs defaultValue="purchases">
            <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="purchases">Purchase History</TabsTrigger>
                <TabsTrigger value="usage">Usage History</TabsTrigger>
            </TabsList>
            <TabsContent value="purchases">
                <Card>
                    <CardHeader><CardTitle>Purchase History</CardTitle><CardDescription>A log of all your inventory purchases.</CardDescription></CardHeader>
                    <CardContent>
                        <TooltipProvider>
                        <Table>
                            <TableHeader><TableRow><TableHead>Date</TableHead><TableHead>Ingredient</TableHead><TableHead>Quantity</TableHead><TableHead>Cost</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader>
                            <TableBody>
                                {purchases.map(t => (
                                    <TableRow key={t.id}>
                                        <TableCell>
                                             <div className="flex items-center gap-2">
                                                {isClient ? format(new Date(t.date), "PPP p") : ''}
                                                {t.editHistory && t.editHistory.length > 0 && (
                                                    <Tooltip>
                                                        <TooltipTrigger><History className="h-4 w-4 text-muted-foreground" /></TooltipTrigger>
                                                        <TooltipContent>
                                                          <div className="text-sm">
                                                            <p className="font-bold">Edit History:</p>
                                                            {t.editHistory.map((edit, index) => (
                                                                <div key={index} className="mt-2 border-t pt-2">
                                                                    <p><b>Edited on:</b> {format(new Date(edit.editedAt), "PPP p")}</p>
                                                                    <p><b>From:</b> {edit.originalValues.quantity} {edit.originalValues.unit} of {edit.originalValues.name}</p>
                                                                    <p><b>To:</b> {t.quantity} {t.unit} of {t.name}</p>
                                                                </div>
                                                            ))}
                                                          </div>
                                                        </TooltipContent>
                                                    </Tooltip>
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell className="font-medium">{t.name}</TableCell>
                                        <TableCell>{t.quantity} {t.unit}</TableCell>
                                        <TableCell>PKR {t.cost?.toFixed(2) ?? 'N/A'}</TableCell>
                                        <TableCell className="text-right">
                                            <Button variant="ghost" size="icon" onClick={() => setEditingTransaction(t)}><Pencil className="h-4 w-4" /><span className="sr-only">Edit</span></Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                        </TooltipProvider>
                    </CardContent>
                </Card>
            </TabsContent>
            <TabsContent value="usage">
                 <Card>
                    <CardHeader><CardTitle>Usage History</CardTitle><CardDescription>A log of all ingredients used.</CardDescription></CardHeader>
                    <CardContent>
                       <TooltipProvider>
                        <Table>
                            <TableHeader><TableRow><TableHead>Date</TableHead><TableHead>Ingredient</TableHead><TableHead>Quantity</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader>
                            <TableBody>
                                {usages.map(t => (
                                    <TableRow key={t.id}>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                {isClient ? format(new Date(t.date), "PPP p") : ''}
                                                {t.editHistory && t.editHistory.length > 0 && (
                                                    <Tooltip>
                                                        <TooltipTrigger><History className="h-4 w-4 text-muted-foreground" /></TooltipTrigger>
                                                        <TooltipContent>
                                                          <div className="text-sm">
                                                            <p className="font-bold">Edit History:</p>
                                                            {t.editHistory.map((edit, index) => (
                                                                <div key={index} className="mt-2 border-t pt-2">
                                                                    <p><b>Edited on:</b> {format(new Date(edit.editedAt), "PPP p")}</p>
                                                                    <p><b>From:</b> {edit.originalValues.quantity} {edit.originalValues.unit} of {edit.originalValues.name}</p>
                                                                    <p><b>To:</b> {t.quantity} {t.unit} of {t.name}</p>
                                                                </div>
                                                            ))}
                                                          </div>
                                                        </TooltipContent>
                                                    </Tooltip>
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell className="font-medium">{t.name}</TableCell>
                                        <TableCell>{t.quantity} {t.unit}</TableCell>
                                        <TableCell className="text-right">
                                            <Button variant="ghost" size="icon" onClick={() => setEditingTransaction(t)}><Pencil className="h-4 w-4" /><span className="sr-only">Edit</span></Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                        </TooltipProvider>
                    </CardContent>
                </Card>
            </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}
