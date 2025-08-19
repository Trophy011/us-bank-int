// src/utils/transactionStorage.ts

export type Transaction = {
  id: string;
  accountId: string;
  type: 'debit' | 'credit' | 'transfer';
  amount: number;
  description: string;
  date: string;
  balance: number;
  currency?: string;
};

const STORAGE_KEY = "transactions";

// Save the full transaction list
export function saveTransactions(transactions: Transaction[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(transactions));
}

// Load transactions (or empty array if none)
export function loadTransactions(): Transaction[] {
  return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
}

// Add a single transaction to history
export function addTransaction(transaction: Transaction) {
  const history = loadTransactions();
  history.push(transaction);
  saveTransactions(history);
}
