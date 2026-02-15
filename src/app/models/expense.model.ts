export interface Expense {
  id: string;
  description: string;
  amount: number;
  category: string;
  date: Date;
}

export type ExpenseCategory = string;

