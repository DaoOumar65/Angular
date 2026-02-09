export interface Expense {
  id: string;
  description: string;
  amount: number;
  category: string;
  date: Date;
}

export type ExpenseCategory = 'Alimentation' | 'Transport' | 'Loisirs' | 'Santé' | 'Logement' | 'Autre';
