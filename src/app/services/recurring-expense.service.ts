import { Injectable, signal } from '@angular/core';
import { RecurringExpense } from '../models/recurring-expense.model';
import { ExpenseService } from './expense.service';

@Injectable({
  providedIn: 'root'
})
export class RecurringExpenseService {
  private recurringExpenses = signal<RecurringExpense[]>(this.loadRecurring());

  constructor(private expenseService: ExpenseService) {
    this.checkAndGenerateExpenses();
  }

  getRecurringExpenses() {
    return this.recurringExpenses.asReadonly();
  }

  addRecurring(recurring: Omit<RecurringExpense, 'id' | 'lastGenerated' | 'nextDue'>) {
    const newRecurring: RecurringExpense = {
      ...recurring,
      id: crypto.randomUUID(),
      nextDue: this.calculateNextDue(recurring.startDate, recurring.frequency)
    };
    this.recurringExpenses.update(list => [...list, newRecurring]);
    this.saveRecurring();
  }

  updateRecurring(id: string, recurring: Partial<RecurringExpense>) {
    this.recurringExpenses.update(list =>
      list.map(r => r.id === id ? { ...r, ...recurring } : r)
    );
    this.saveRecurring();
  }

  deleteRecurring(id: string) {
    this.recurringExpenses.update(list => list.filter(r => r.id !== id));
    this.saveRecurring();
  }

  toggleActive(id: string) {
    this.recurringExpenses.update(list =>
      list.map(r => r.id === id ? { ...r, isActive: !r.isActive } : r)
    );
    this.saveRecurring();
  }

  checkAndGenerateExpenses() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    this.recurringExpenses().forEach(recurring => {
      if (!recurring.isActive) return;
      if (recurring.endDate && new Date(recurring.endDate) < today) return;

      const nextDue = recurring.nextDue ? new Date(recurring.nextDue) : null;
      if (nextDue && nextDue <= today) {
        this.generateExpense(recurring);
      }
    });
  }

  private generateExpense(recurring: RecurringExpense) {
    this.expenseService.addExpense({
      description: recurring.description,
      amount: recurring.amount,
      category: recurring.category as any,
      date: new Date()
    });

    const nextDue = this.calculateNextDue(new Date(), recurring.frequency);
    this.updateRecurring(recurring.id, {
      lastGenerated: new Date(),
      nextDue
    });
  }

  private calculateNextDue(date: Date, frequency: string): Date {
    const next = new Date(date);
    switch (frequency) {
      case 'daily':
        next.setDate(next.getDate() + 1);
        break;
      case 'weekly':
        next.setDate(next.getDate() + 7);
        break;
      case 'monthly':
        next.setMonth(next.getMonth() + 1);
        break;
      case 'yearly':
        next.setFullYear(next.getFullYear() + 1);
        break;
    }
    return next;
  }

  private saveRecurring() {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('recurringExpenses', JSON.stringify(this.recurringExpenses()));
    }
  }

  private loadRecurring(): RecurringExpense[] {
    if (typeof localStorage !== 'undefined') {
      const saved = localStorage.getItem('recurringExpenses');
      if (saved) {
        return JSON.parse(saved).map((r: any) => ({
          ...r,
          startDate: new Date(r.startDate),
          endDate: r.endDate ? new Date(r.endDate) : undefined,
          lastGenerated: r.lastGenerated ? new Date(r.lastGenerated) : undefined,
          nextDue: r.nextDue ? new Date(r.nextDue) : undefined
        }));
      }
    }
    return [];
  }
}
