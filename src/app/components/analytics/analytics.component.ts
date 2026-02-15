import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ExpenseService } from '../../services/expense.service';
import { BudgetService } from '../../services/budget.service';
import { CategoryService } from '../../services/category.service';
import { CustomCurrencyPipe } from '../../pipes/custom-currency.pipe';

@Component({
  selector: 'app-analytics',
  imports: [CommonModule, CustomCurrencyPipe],
  templateUrl: './analytics.component.html',
  styleUrl: './analytics.component.scss'
})
export class AnalyticsComponent {
  constructor(
    public expenseService: ExpenseService,
    public budgetService: BudgetService,
    private categoryService: CategoryService
  ) {}

  get categoryStats() {
    return this.expenseService.getExpensesByCategory();
  }

  get monthlyTrend() {
    return this.expenseService.getMonthlyTrend(12);
  }

  get totalExpenses() {
    return this.expenseService.getTotalExpenses();
  }

  get averagePerMonth() {
    const trend = this.monthlyTrend;
    if (trend.length === 0) return 0;
    const total = trend.reduce((sum, item) => sum + item.total, 0);
    return total / trend.length;
  }

  get highestCategory() {
    const stats = this.categoryStats;
    if (stats.length === 0) return null;
    return stats.reduce((max, cat) => (cat.total > max.total ? cat : max));
  }

  get comparison() {
    return this.expenseService.getComparison();
  }

  get forecastEndMonth() {
    return this.expenseService.forecastEndOfMonthTotal();
  }

  get monthlyBudgetStatus() {
    return this.budgetService.getBudgetStatus('monthly', this.expenseService.getTotalByPeriod('month'));
  }

  get anomalies() {
    return this.expenseService.getAnomaliesLast30Days();
  }

  getCategoryIcon(category: string): string {
    return this.categoryService.getCategoryIcon(category);
  }

  getCategoryPercentage(total: number): number {
    if (this.totalExpenses === 0) return 0;
    return (total / this.totalExpenses) * 100;
  }

  getTrendBarHeight(total: number): number {
    const values = this.monthlyTrend.map((item) => item.total);
    const max = Math.max(...values, 0);
    if (max <= 0) return 0;
    const raw = (total / max) * 100;
    return Math.max(0, Math.min(raw, 100));
  }
}

