'use server';

import fs from 'fs/promises';
import path from 'path';
import { revalidatePath } from 'next/cache';

import type { Sale, Expense, InventoryItem, InventoryTransaction, SaleVariation } from './data-types';
import { saleVariationsInfo } from './data-types';


// Define paths to JSON files
const dataDir = path.resolve(process.cwd(), 'data');
const salesPath = path.join(dataDir, 'sales.json');
const expensesPath = path.join(dataDir, 'expenses.json');
const inventoryPath = path.join(dataDir, 'inventory.json');
const inventoryTransactionsPath = path.join(dataDir, 'inventoryTransactions.json');

// Ensure data directory exists
async function ensureDataDirectory() {
  try {
    await fs.access(dataDir);
  } catch {
    await fs.mkdir(dataDir);
  }
}

// Function to read data from JSON file or return initial data
async function readData<T>(filePath: string, initialData: T[]): Promise<T[]> {
  await ensureDataDirectory();
  try {
    await fs.access(filePath);
    const fileContent = await fs.readFile(filePath, 'utf-8');
    // Ensure dates are parsed correctly
    return JSON.parse(fileContent, (key, value) => {
        if (key === 'date' || key === 'lastUpdated' || key === 'editedAt') {
          return new Date(value);
        }
        return value;
      });
  } catch (error) {
    // If the file doesn't exist, write the initial data and return it
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
        await writeData(filePath, initialData);
        return initialData;
    }
    console.error(`Error reading ${filePath}:`, error);
    return initialData;
  }
}


// Function to write data to JSON file
async function writeData<T>(filePath: string, data: T[]): Promise<void> {
  await ensureDataDirectory();
  try {
    await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf-8');
  } catch (error) {
    console.error(`Error writing to ${filePath}:`, error);
  }
}


// --- Initial Data ---
const initialSales: Sale[] = [
    { id: '1', date: new Date('2023-10-26T10:00:00Z'), variation: 'large', quantity: 1, amount: saleVariationsInfo.large.defaultPrice * 1, type: 'easypaisa' },
    { id: '2', date: new Date('2023-10-26T11:30:00Z'), variation: 'small', quantity: 2, amount: saleVariationsInfo.small.defaultPrice * 2, type: 'cash' },
];

const initialExpenses: Expense[] = [
    { id: '1', date: new Date('2023-10-25T09:00:00Z'), amount: 1500, category: 'rent', description: 'Monthly rent' },
];

const initialInventory: InventoryItem[] = [
    { id: '1', name: 'Chicken', quantity: 20, unit: 'kg', lastUpdated: new Date('2023-10-26T10:00:00Z') },
    { id: '2', name: 'Pita Bread', quantity: 100, unit: 'pcs', lastUpdated: new Date('2023-10-26T10:00:00Z') },
];

const initialInventoryTransactions: InventoryTransaction[] = [
    { id: 'p1', date: new Date('2023-10-26T10:00:00Z'), type: 'purchase', name: 'Chicken', quantity: 25, unit: 'kg', cost: 20000 },
];


// --- Server Actions ---

export async function getSales() {
    return readData<Sale>(salesPath, initialSales);
}
export async function getExpenses() {
    return readData<Expense>(expensesPath, initialExpenses);
}
export async function getInventory() {
    return readData<InventoryItem>(inventoryPath, initialInventory);
}
export async function getInventoryTransactions() {
    return readData<InventoryTransaction>(inventoryTransactionsPath, initialInventoryTransactions);
}

export async function addSale(sale: Omit<Sale, 'id'>) {
    const sales = await getSales();
    const newSale = { ...sale, id: (sales.length + 1).toString() };
    const newSales = [newSale, ...sales];
    await writeData(salesPath, newSales);
    revalidatePath('/sales');
    revalidatePath('/');
    return newSale;
}

export async function updateSale(updatedSale: Sale) {
    const sales = await getSales();
    const newSales = sales.map(s => s.id === updatedSale.id ? updatedSale : s);
    await writeData(salesPath, newSales);
    revalidatePath('/sales');
    revalidatePath('/');
}

export async function addExpense(expense: Omit<Expense, 'id'>) {
    const expenses = await getExpenses();
    const newExpense = { ...expense, id: (expenses.length + 1).toString() };
    const newExpenses = [newExpense, ...expenses];
    await writeData(expensesPath, newExpenses);
    revalidatePath('/expenses');
    revalidatePath('/');
    return newExpense;
}


export async function addInventoryTransaction(transaction: Omit<InventoryTransaction, 'id'>) {
    const transactions = await getInventoryTransactions();
    const newTransaction = { ...transaction, id: `tx${transactions.length + 1}`};
    const newTransactions = [newTransaction, ...transactions];
    await writeData(inventoryTransactionsPath, newTransactions);
    revalidatePath('/inventory');
    return newTransaction;
}

export async function updateInventoryTransaction(updatedTransaction: InventoryTransaction) {
    const transactions = await getInventoryTransactions();
    const newTransactions = transactions.map(t => t.id === updatedTransaction.id ? updatedTransaction : t);
    await writeData(inventoryTransactionsPath, newTransactions);
    revalidatePath('/inventory');
}

export async function updateAllInventory(newInventory: InventoryItem[]) {
    await writeData(inventoryPath, newInventory);
    revalidatePath('/inventory');
    revalidatePath('/');
}

export async function addExpenseFromPurchase(purchase: { quantity: number; unit: string; name: string, cost: number}) {
    const newExpense: Omit<Expense, 'id'> = {
        date: new Date(),
        amount: purchase.cost,
        category: 'supplies',
        description: `Purchase: ${purchase.quantity} ${purchase.unit} of ${purchase.name}`
    };
    await addExpense(newExpense);
}
