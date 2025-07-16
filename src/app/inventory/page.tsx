"use client";

import { useState } from "react";
import { AppLayout } from "@/components/app-layout";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { mockInventory, type InventoryItem } from "@/lib/data";
import { format } from "date-fns";
import { PlusCircle, MinusCircle } from "lucide-react";

export default function InventoryPage() {
  const [inventory, setInventory] = useState<InventoryItem[]>(mockInventory);

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

  return (
    <AppLayout>
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <h1 className="font-headline text-3xl font-bold">Inventory</h1>
          <div className="flex gap-2">
            <Button variant="outline">
              <PlusCircle className="mr-2 h-4 w-4" />
              Add Purchase
            </Button>
            <Button variant="outline">
              <MinusCircle className="mr-2 h-4 w-4" />
              Record Usage
            </Button>
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
                    <TableCell>{format(item.lastUpdated, "PPP p")}</TableCell>
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
