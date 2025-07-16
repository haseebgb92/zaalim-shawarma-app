"use client";

import { useState } from "react";
import { AppLayout } from "@/components/app-layout";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Sparkles, Loader2 } from "lucide-react";
import { suggestIngredients, SuggestIngredientsOutput } from "@/ai/flows/suggest-ingredients";
import { mockSales } from "@/lib/data";
import { useToast } from "@/hooks/use-toast";

// Helper to convert sales data to CSV
const toCSV = (data: any[]) => {
  if (data.length === 0) return "";
  const headers = Object.keys(data[0]).join(',');
  const rows = data.map(row => {
      return Object.values(row).map(val => {
          if (val instanceof Date) return val.toISOString().split('T')[0];
          return String(val);
      }).join(',');
  });
  return [headers, ...rows].join('\n');
};

export default function SuggestionsPage() {
  const [season, setSeason] = useState("Summer");
  const [menu, setMenu] = useState("Shawarma Wrap - $12\nChicken Plate - $15\nFalafel Wrap - $10");
  const [suggestion, setSuggestion] = useState<SuggestIngredientsOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleGenerateSuggestion = async () => {
    setIsLoading(true);
    setSuggestion(null);
    try {
      const salesCSV = toCSV(mockSales);
      const result = await suggestIngredients({
        salesData: salesCSV,
        season: season,
        menu: menu,
      });
      setSuggestion(result);
    } catch (error) {
      console.error("Error generating suggestion:", error);
      toast({
        title: "Error",
        description: "Failed to generate AI suggestion. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AppLayout>
      <div className="flex flex-col gap-6">
        <h1 className="font-headline text-3xl font-bold">AI Ingredient Suggestions</h1>
        <div className="grid gap-6 lg:grid-cols-3">
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle>Generate Suggestion</CardTitle>
              <CardDescription>Provide details to get AI-powered ingredient suggestions.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="season">Season</Label>
                <Select value={season} onValueChange={setSeason}>
                  <SelectTrigger id="season">
                    <SelectValue placeholder="Select a season" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Spring">Spring</SelectItem>
                    <SelectItem value="Summer">Summer</SelectItem>
                    <SelectItem value="Fall">Fall</SelectItem>
                    <SelectItem value="Winter">Winter</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="menu">Current Menu</Label>
                <Textarea
                  id="menu"
                  value={menu}
                  onChange={(e) => setMenu(e.target.value)}
                  placeholder="Enter your menu items and prices..."
                  rows={5}
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={handleGenerateSuggestion} disabled={isLoading} className="w-full">
                {isLoading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Sparkles className="mr-2 h-4 w-4" />
                )}
                Generate
              </Button>
            </CardFooter>
          </Card>
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Suggestion Details</CardTitle>
              <CardDescription>Optimal ingredient quantities to order and prepare.</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading && (
                <div className="flex h-64 items-center justify-center">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              )}
              {suggestion ? (
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold mb-2">Suggested Quantities</h3>
                    <div className="rounded-md border p-4">
                      <ul className="grid grid-cols-2 gap-x-4 gap-y-1">
                        {Object.entries(suggestion.ingredientSuggestions).map(([ingredient, quantity]) => (
                          <li key={ingredient} className="flex justify-between">
                            <span className="font-medium capitalize">{ingredient}:</span> 
                            <span>{quantity} units</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">Reasoning</h3>
                    <p className="text-sm text-muted-foreground rounded-md border p-4 bg-background/50">
                      {suggestion.reasoning}
                    </p>
                  </div>
                </div>
              ) : (
                !isLoading && <div className="flex h-64 items-center justify-center"><p className="text-center text-muted-foreground">Your suggestion will appear here.</p></div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}
