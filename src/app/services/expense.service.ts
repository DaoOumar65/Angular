import { Injectable, inject, signal } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { Expense } from '../models/expense.model';
import { API_BASE_URL } from '../config/api.config';
import { CategoryService } from './category.service';

export interface ExpenseImportRow {
  description: string;
  amount: number;
  category: string;
  date: Date;
}

interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
}

interface ApiExpense {
  id: number | string;
  description: string;
  amount: number;
  date: string;
  category_id?: number;
  category?: {
    id: number;
    name: string;
  };
}

interface ApiPaginated<T> {
  data: T[];
}

@Injectable({
  providedIn: 'root'
})
export class ExpenseService {
  private readonly http = inject(HttpClient);
  private readonly categoryService = inject(CategoryService);
  private expenses = signal<Expense[]>([]);

  getExpenses() {
    return this.expenses.asReadonly();
  }

  async loadExpenses(): Promise<void> {
    try {
      const params = new HttpParams()
        .set('per_page', '1000')
        .set('sort_by', 'date')
        .set('sort_dir', 'desc');

      const response = await firstValueFrom(
        this.http.get<ApiResponse<ApiPaginated<ApiExpense> | ApiExpense[]>>(`${API_BASE_URL}/expenses`, { params })
      );

      const payload = response.data as any;
      const items: ApiExpense[] = Array.isArray(payload) ? payload : (payload?.data || []);
      this.expenses.set(items.map((item) => this.toExpense(item)));
    } catch {
      this.expenses.set([]);
    }
  }

  async addExpense(expense: Omit<Expense, 'id'>): Promise<void> {
    await this.addExpenses([expense]);
  }

  async addExpenses(expenses: Omit<Expense, 'id'>[]): Promise<void> {
    if (expenses.length === 0) return;
    await this.categoryService.loadCategories();

    const items = [] as Array<{ description: string; amount: number; category_id: number; date: string }>;

    for (const expense of expenses) {
      const categoryId = await this.resolveCategoryId(expense.category);
      if (!categoryId) {
        continue;
      }

      items.push({
        description: expense.description,
        amount: this.roundAmount(Number(expense.amount)),
        category_id: categoryId,
        date: this.toApiDate(expense.date)
      });
    }

    if (items.length === 0) {
      throw new Error('Categorie invalide. Rechargez les categories puis reessayez.');
    }

    if (items.length === 1) {
      await firstValueFrom(this.http.post(`${API_BASE_URL}/expenses`, items[0]));
    } else {
      await firstValueFrom(this.http.post(`${API_BASE_URL}/expenses/bulk`, { items }));
    }

    await this.loadExpenses();
  }

  async importExpenses(rows: ExpenseImportRow[]): Promise<void> {
    const normalized = rows
      .filter((row) => row.description && row.amount > 0 && row.category && row.date)
      .map((row) => ({
        description: row.description.trim(),
        amount: Number(row.amount),
        category: row.category.trim(),
        date: new Date(row.date)
      }));

    await this.addExpenses(normalized);
  }

  async updateExpense(id: string, expense: Omit<Expense, 'id'>): Promise<void> {
    await this.categoryService.loadCategories();
    const categoryId = await this.resolveCategoryId(expense.category);
    if (!categoryId) return;

    await firstValueFrom(
      this.http.put(`${API_BASE_URL}/expenses/${id}`, {
        description: expense.description,
        amount: this.roundAmount(Number(expense.amount)),
        category_id: categoryId,
        date: this.toApiDate(expense.date)
      })
    );

    await this.loadExpenses();
  }

  async deleteExpense(id: string): Promise<void> {
    await firstValueFrom(this.http.delete(`${API_BASE_URL}/expenses/${id}`));
    this.expenses.update((items) => items.filter((item) => item.id !== id));
  }

  renameCategory(oldCategory: string, newCategory: string) {
    this.expenses.update((items) =>
      items.map((item) => (item.category === oldCategory ? { ...item, category: newCategory } : item))
    );
  }

  reassignCategory(oldCategory: string, replacementCategory: string) {
    this.expenses.update((items) =>
      items.map((item) => (item.category === oldCategory ? { ...item, category: replacementCategory } : item))
    );
  }

  getTotalExpenses(): number {
    return this.expenses().reduce((total, expense) => total + expense.amount, 0);
  }

  getExpensesByPeriod(period: 'day' | 'week' | 'month' | 'year', date: Date = new Date()): Expense[] {
    return this.expenses().filter((expense) => {
      const expenseDate = new Date(expense.date);

      if (period === 'day') {
        return expenseDate.toDateString() === date.toDateString();
      }

      if (period === 'week') {
        const weekStart = new Date(date);
        weekStart.setDate(date.getDate() - date.getDay() + 1);
        weekStart.setHours(0, 0, 0, 0);

        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekStart.getDate() + 6);
        weekEnd.setHours(23, 59, 59, 999);

        return expenseDate >= weekStart && expenseDate <= weekEnd;
      }

      if (period === 'month') {
        return expenseDate.getMonth() === date.getMonth() && expenseDate.getFullYear() === date.getFullYear();
      }

      if (period === 'year') {
        return expenseDate.getFullYear() === date.getFullYear();
      }

      return false;
    });
  }

  getExpensesByDateRange(startDate: Date | null, endDate: Date | null): Expense[] {
    return this.expenses().filter((expense) => {
      const date = new Date(expense.date);
      if (startDate && date < startDate) return false;
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        if (date > end) return false;
      }
      return true;
    });
  }

  getTotalByPeriod(period: 'day' | 'week' | 'month' | 'year', date: Date = new Date()): number {
    const items = this.getExpensesByPeriod(period, date);
    return items.reduce((total, expense) => total + expense.amount, 0);
  }

  getExpensesByCategory(): { category: string; total: number; count: number }[] {
    const categoryMap = new Map<string, { total: number; count: number }>();

    this.expenses().forEach((expense) => {
      const existing = categoryMap.get(expense.category) || { total: 0, count: 0 };
      categoryMap.set(expense.category, {
        total: existing.total + expense.amount,
        count: existing.count + 1
      });
    });

    return Array.from(categoryMap.entries())
      .map(([category, data]) => ({ category, total: data.total, count: data.count }))
      .sort((a, b) => b.total - a.total);
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

  getComparison(): { current: number; previous: number; change: number } {
    const now = new Date();
    const current = this.getTotalByPeriod('month', now);
    const previous = this.getTotalByPeriod('month', new Date(now.getFullYear(), now.getMonth() - 1, 1));
    const change = previous > 0 ? ((current - previous) / previous) * 100 : 0;
    return { current, previous, change };
  }

  forecastEndOfMonthTotal(date: Date = new Date()): number {
    const currentTotal = this.getTotalByPeriod('month', date);
    const dayOfMonth = date.getDate();
    const daysInMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
    if (dayOfMonth <= 0) return currentTotal;

    const dailyAverage = currentTotal / dayOfMonth;
    return dailyAverage * daysInMonth;
  }

  getAnomaliesLast30Days(): Expense[] {
    const now = new Date();
    const start = new Date(now);
    start.setDate(now.getDate() - 30);

    const recent = this.getExpensesByDateRange(start, now);
    if (recent.length < 5) {
      return [];
    }

    const average = recent.reduce((sum, item) => sum + item.amount, 0) / recent.length;
    const threshold = average * 2;

    return recent
      .filter((item) => item.amount >= threshold)
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 5);
  }

  private async resolveCategoryId(categoryName: string): Promise<number | null> {
    let categoryId = this.categoryService.getCategoryIdByName(categoryName);
    if (categoryId) return categoryId;

    const created = await this.categoryService.addCategory(categoryName);
    if (created) {
      categoryId = this.categoryService.getCategoryIdByName(categoryName);
    }

    if (!categoryId) {
      await this.categoryService.loadCategories();
      categoryId = this.categoryService.getCategoryIdByName(categoryName);
    }

    return categoryId;
  }

  private toApiDate(date: Date | string): string {
    const value = new Date(date);
    return value.toISOString().split('T')[0];
  }

  private toExpense(item: ApiExpense): Expense {
    return {
      id: String(item.id),
      description: item.description,
      amount: this.roundAmount(Number(item.amount)),
      category: item.category?.name || 'Autre',
      date: new Date(item.date)
    };
  }

  private roundAmount(value: number): number {
    return Math.round((value + Number.EPSILON) * 1_000_000) / 1_000_000;
  }
}
