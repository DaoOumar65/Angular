import { Injectable, signal, PLATFORM_ID, inject, computed } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Expense } from '../models/expense.model';

@Injectable({
  providedIn: 'root'
})
export class ExpenseService {
  private platformId = inject(PLATFORM_ID);
  private expenses = signal<Expense[]>(this.loadFromLocalStorage());

  getExpenses() {
    return this.expenses.asReadonly();
  }

  addExpense(expense: Omit<Expense, 'id'>) {
    const newExpense: Expense = {
      ...expense,
      id: crypto.randomUUID()
    };
    this.expenses.update(expenses => [...expenses, newExpense]);
    this.saveToLocalStorage();
  }

  deleteExpense(id: string) {
    this.expenses.update(expenses => expenses.filter(e => e.id !== id));
    this.saveToLocalStorage();
  }

  getTotalExpenses(): number {
    return this.expenses().reduce((total, expense) => total + expense.amount, 0);
  }

  // Nouvelles méthodes pour les filtres
  getExpensesByPeriod(period: 'day' | 'month' | 'year', date: Date = new Date()): Expense[] {
    return this.expenses().filter(expense => {
      const expenseDate = new Date(expense.date);
      
      if (period === 'day') {
        return expenseDate.toDateString() === date.toDateString();
      }
      
      if (period === 'month') {
        return expenseDate.getMonth() === date.getMonth() && 
               expenseDate.getFullYear() === date.getFullYear();
      }
      
      if (period === 'year') {
        return expenseDate.getFullYear() === date.getFullYear();
      }
      
      return false;
    });
  }

  getTotalByPeriod(period: 'day' | 'month' | 'year', date: Date = new Date()): number {
    const expenses = this.getExpensesByPeriod(period, date);
    return expenses.reduce((total, expense) => total + expense.amount, 0);
  }

  getExpensesByCategory(): { category: string; total: number; count: number }[] {
    const categoryMap = new Map<string, { total: number; count: number }>();
    
    this.expenses().forEach(expense => {
      const existing = categoryMap.get(expense.category) || { total: 0, count: 0 };
      categoryMap.set(expense.category, {
        total: existing.total + expense.amount,
        count: existing.count + 1
      });
    });
    
    return Array.from(categoryMap.entries()).map(([category, data]) => ({
      category,
      total: data.total,
      count: data.count
    }));
  }

  getMonthlyTrend(months: number = 6): { month: string; total: number }[] {
    const result: { month: string; total: number }[] = [];
    const now = new Date();
    
    for (let i = months - 1; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const total = this.getTotalByPeriod('month', date);
      const monthName = date.toLocaleDateString('fr-FR', { month: 'short', year: 'numeric' });
      result.push({ month: monthName, total });
    }
    
    return result;
  }

  private saveToLocalStorage() {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem('expenses', JSON.stringify(this.expenses()));
    }
  }

  private loadFromLocalStorage(): Expense[] {
    if (isPlatformBrowser(this.platformId)) {
      const data = localStorage.getItem('expenses');
      if (data) {
        const expenses = JSON.parse(data);
        return expenses.map((e: any) => ({ ...e, date: new Date(e.date) }));
      }
    }
    return [];
  }
}
