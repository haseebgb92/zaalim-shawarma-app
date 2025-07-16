// This file defines the data structures for the application.
// It is safe to import from both client and server components.

export const saleVariationsInfo = {
  small: { name: "Small Shawarma", defaultPrice: 800 },
  medium: { name: "Medium Shawarma", defaultPrice: 1000 },
  large: { name: "Large Shawarma", defaultPrice: 1200 },
  "bun-burger": { name: "Bun Burger", defaultPrice: 900 },
} as const;

export type SaleVariation = keyof typeof saleVariationsInfo;

export type Sale = {
  id: string;
  date: Date;
  variation: SaleVariation;
  quantity: number;
  amount: number;
  type: 'cash' | 'easypaisa' | 'jazzcash';
  editHistory?: {
    editedAt: Date;
    originalValues: {
        variation: SaleVariation;
        quantity: number;
        type: 'cash' | 'easypaisa' | 'jazzcash';
        amount: number;
    }
  }[];
};

export type Expense = {
  id: string;
  date: Date;
  amount: number;
  category: 'rent' | 'utilities' | 'salaries' | 'supplies' | 'marketing' | 'other';
  description: string;
};

export type InventoryItem = {
  id: string;
  name: string;
  quantity: number;
  unit: 'kg' | 'g' | 'l' | 'ml' | 'pcs';
  lastUpdated: Date;
};

export type InventoryTransaction = {
  id: string;
  date: Date;
  type: 'purchase' | 'usage';
  name: string;
  quantity: number;
  unit: 'kg' | 'g' | 'l' | 'ml' | 'pcs';
  cost?: number; // Optional cost for purchases
  editHistory?: {
    editedAt: Date;
    originalValues: Omit<InventoryTransaction, 'id' | 'date' | 'editHistory'>;
  }[];
};
