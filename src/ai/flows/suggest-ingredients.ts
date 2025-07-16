'use server';

/**
 * @fileOverview An AI agent that suggests ingredient quantities to order and prepare.
 *
 * - suggestIngredients - A function that provides ingredient suggestions.
 * - SuggestIngredientsInput - The input type for the suggestIngredients function.
 * - SuggestIngredientsOutput - The return type for the suggestIngredients function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestIngredientsInputSchema = z.object({
  salesData: z.string().describe('Historical sales data in CSV format.'),
  season: z.string().describe('The current season (e.g., Spring, Summer, Fall, Winter).'),
  menu: z.string().describe('Current menu with prices'),
});
export type SuggestIngredientsInput = z.infer<typeof SuggestIngredientsInputSchema>;

const SuggestIngredientsOutputSchema = z.object({
  ingredientSuggestions: z
    .record(z.string(), z.number())
    .describe('Suggested quantities for each ingredient (e.g., { tomatoes: 10, onions: 5 }).'),
  reasoning: z.string().describe('Explanation of why these ingredient quantities are suggested.'),
});
export type SuggestIngredientsOutput = z.infer<typeof SuggestIngredientsOutputSchema>;

export async function suggestIngredients(input: SuggestIngredientsInput): Promise<SuggestIngredientsOutput> {
  return suggestIngredientsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestIngredientsPrompt',
  input: {schema: SuggestIngredientsInputSchema},
  output: {schema: SuggestIngredientsOutputSchema},
  prompt: `You are an AI assistant specialized in providing ingredient suggestions for shawarma restaurants. 
  Based on the provided sales data, current season, and menu, suggest optimal quantities for each ingredient to order and prepare. 
  Consider sales trends, seasonality, and predicted waste reduction to minimize waste and maximize profits. Always provide a clear reasoning for the suggestion.

Sales Data (CSV):\n{{{salesData}}}

Current Season: {{{season}}}

Menu: {{{menu}}}

Output the ingredient suggestions as a JSON object where keys are ingredient names and values are suggested quantities.
Also, provide the reason for these suggestions.
`,
});

const suggestIngredientsFlow = ai.defineFlow(
  {
    name: 'suggestIngredientsFlow',
    inputSchema: SuggestIngredientsInputSchema,
    outputSchema: SuggestIngredientsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
