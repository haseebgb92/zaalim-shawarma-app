export const saleVariations = {
  small: { name: "Small Shawarma", price: 8.00 },
  medium: { name: "Medium Shawarma", price: 10.00 },
  large: { name: "Large Shawarma", price: 12.00 },
  "bun-burger": { name: "Bun Burger", price: 9.00 },
} as const;

export type SaleVariation = keyof typeof saleVariations;

export type Sale = {
  id: string;
  date: Date;
  variation: SaleVariation;
  quantity: number;
  amount: number;
  type: 'cash' | 'card';
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
  { id: '1', date: new Date('2023-10-26T10:00:00Z'), variation: 'large', quantity: 1, amount: 12.00, type: 'card' },
  { id: '2', date: new Date('2023-10-26T11:30:00Z'), variation: 'small', quantity: 2, amount: 16.00, type: 'cash' },
  { id: '3', date: new Date('2023-10-25T14:00:00Z'), variation: 'medium', quantity: 3, amount: 30.00, type: 'card' },
  { id: '4', date: new Date('2023-10-24T18:45:00Z'), variation: 'bun-burger', quantity: 1, amount: 9.00, type: 'cash' },
  { id: '5', date: new Date('2023-10-23T12:15:00Z'), variation: 'large', quantity: 2, amount: 24.00, type: 'card' },
];

export const mockExpenses: Expense[] = [
  { id: '1', date: new Date('2023-10-25'), amount: 1500, category: 'rent', description: 'Monthly rent' },
  { id: '2', date: new Date('2023-10-20'), amount: 350, category: 'supplies', description: 'Vegetables and meat' },
  { id: '3', date: new Date('2023-10-15'), amount: 250, category: 'utilities', description: 'Electricity bill' },
  { id: '4', date: new Date('2023-10-01'), amount: 2500, category: 'salaries', description: 'Staff salaries' },
];

export const mockInventory: InventoryItem[] = [
  { id: '1', name: 'Chicken', quantity: 20, unit: 'kg', lastUpdated: new Date() },
  { id: '2', name: 'Tomatoes', quantity: 8, unit: 'kg', lastUpdated: new Date() },
  { id: '3', name: 'Pita Bread', quantity: 100, unit: 'pcs', lastUpdated: new Date() },
  { id: '4', name: 'Tahini Sauce', quantity: 5, unit: 'l', lastUpdated: new Date() },
  { id: '5', name: 'Onions', quantity: 15, unit: 'kg', lastUpdated: new Date() },
  { id: '6', name: 'Lettuce', quantity: 5, unit: 'kg', lastUpdated: new Date() },
];
