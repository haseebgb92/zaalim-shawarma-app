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

export const mockSales: Sale[] = [
  { id: '1', date: new Date('2023-10-26T10:00:00Z'), variation: 'large', quantity: 1, amount: 1200.00, type: 'easypaisa' },
  { id: '2', date: new Date('2023-10-26T11:30:00Z'), variation: 'small', quantity: 2, amount: 1600.00, type: 'cash' },
  { id: '3', date: new Date('2023-10-25T14:00:00Z'), variation: 'medium', quantity: 3, amount: 3000.00, type: 'jazzcash' },
  { id: '4', date: new Date('2023-10-24T18:45:00Z'), variation: 'bun-burger', quantity: 1, amount: 900.00, type: 'cash' },
  { id: '5', date: new Date('2023-10-23T12:15:00Z'), variation: 'large', quantity: 2, amount: 2400.00, type: 'easypaisa' },
];

export const mockExpenses: Expense[] = [
  { id: '1', date: new Date('2023-10-25T09:00:00Z'), amount: 1500, category: 'rent', description: 'Monthly rent' },
  { id: '2', date: new Date('2023-10-20T17:30:00Z'), amount: 350, category: 'supplies', description: 'Vegetables and meat' },
  { id: '3', date: new Date('2023-10-15T11:00:00Z'), amount: 250, category: 'utilities', description: 'Electricity bill' },
  { id: '4', date: new Date('2023-10-01T12:00:00Z'), amount: 2500, category: 'salaries', description: 'Staff salaries' },
];

export const mockInventory: InventoryItem[] = [
  { id: '1', name: 'Chicken', quantity: 20, unit: 'kg', lastUpdated: new Date('2023-10-26T10:00:00Z') },
  { id: '2', name: 'Tomatoes', quantity: 8, unit: 'kg', lastUpdated: new Date('2023-10-26T10:00:00Z') },
  { id: '3', name: 'Pita Bread', quantity: 100, unit: 'pcs', lastUpdated: new Date('2023-10-26T10:00:00Z') },
  { id: '4', name: 'Tahini Sauce', quantity: 5, unit: 'l', lastUpdated: new Date('2023-10-26T10:00:00Z') },
  { id: '5', name: 'Onions', quantity: 15, unit: 'kg', lastUpdated: new Date('2023-10-26T10:00:00Z') },
  { id: '6', name: 'Lettuce', quantity: 5, unit: 'kg', lastUpdated: new Date('2023-10-26T10:00:00Z') },
];