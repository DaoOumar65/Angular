import { Injectable, signal } from '@angular/core';
import { Income } from '../models/income.model';

@Injectable({
  providedIn: 'root'
})
export class IncomeService {
  private incomes = signal<Income[]>(this.loadIncomes());

  getIncomes() {
    return this.incomes.asReadonly();
  }

  addIncome(income: Omit<Income, 'id'>) {
    const newIncome: Income = {
      ...income,
      id: crypto.randomUUID()
    };
    this.incomes.update(list => [...list, newIncome]);
    this.saveIncomes();
  }

  updateIncome(id: string, income: Omit<Income, 'id'>) {
    this.incomes.update(list =>
      list.map(i => i.id === id ? { ...income, id } : i)
    );
    this.saveIncomes();
  }

  deleteIncome(id: string) {
    this.incomes.update(list => list.filter(i => i.id !== id));
    this.saveIncomes();
  }

  getTotalIncome(): number {
    return this.incomes().reduce((sum, income) => sum + income.amount, 0);
  }

  getIncomeByPeriod(period: 'day' | 'month' | 'year', date: Date = new Date()): number {
    return this.incomes()
      .filter(income => {
        const incomeDate = new Date(income.date);
        if (period === 'day') {
          return incomeDate.toDateString() === date.toDateString();
        }
        if (period === 'month') {
          return incomeDate.getMonth() === date.getMonth() &&
                 incomeDate.getFullYear() === date.getFullYear();
        }
        if (period === 'year') {
          return incomeDate.getFullYear() === date.getFullYear();
        }
        return false;
      })
      .reduce((sum, income) => sum + income.amount, 0);
  }

  private saveIncomes() {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('incomes', JSON.stringify(this.incomes()));
    }
  }

  private loadIncomes(): Income[] {
    if (typeof localStorage !== 'undefined') {
      const saved = localStorage.getItem('incomes');
      if (saved) {
        return JSON.parse(saved).map((i: any) => ({
          ...i,
          date: new Date(i.date)
        }));
      }
    }
    return [];
  }
}
