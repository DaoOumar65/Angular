import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ExpenseService } from '../../services/expense.service';
import { BudgetService } from '../../services/budget.service';
import { CategoryService } from '../../services/category.service';
import { CustomCurrencyPipe } from '../../pipes/custom-currency.pipe';

@Component({
  selector: 'app-dashboard',
  imports: [CommonModule, CustomCurrencyPipe],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent {
  selectedPeriod: 'day' | 'week' | 'month' | 'year' = 'month';
  currentDate = new Date();

  constructor(
    public expenseService: ExpenseService,
    public budgetService: BudgetService,
    private categoryService: CategoryService
  ) {}

  get totalToday() {
    return this.expenseService.getTotalByPeriod('day', this.currentDate);
  }

  get totalWeek() {
    return this.expenseService.getTotalByPeriod('week', this.currentDate);
  }

  get totalMonth() {
    return this.expenseService.getTotalByPeriod('month', this.currentDate);
  }

  get totalYear() {
    return this.expenseService.getTotalByPeriod('year', this.currentDate);
  }

  get expenseCount() {
    return this.expenseService.getExpenses()().length;
  }

  get categoryStats() {
    return this.expenseService.getExpensesByCategory();
  }

  get monthlyTrend() {
    return this.expenseService.getMonthlyTrend(6);
  }

  get totalExpenses() {
    return this.expenseService.getTotalExpenses();
  }

  get dayBudgetStatus() {
    return this.budgetService.getBudgetStatus('daily', this.totalToday);
  }

  get weekBudgetStatus() {
    return this.budgetService.getBudgetStatus('weekly', this.totalWeek);
  }

  get monthBudgetStatus() {
    return this.budgetService.getBudgetStatus('monthly', this.totalMonth);
  }

  get forecastEndMonth() {
    return this.expenseService.forecastEndOfMonthTotal(this.currentDate);
  }

  get estimatedSavings() {
    return this.budgetService.getMonthlySavingsGoal()() - this.forecastEndMonth;
  }

  setPeriod(period: 'day' | 'week' | 'month' | 'year') {
    this.selectedPeriod = period;
  }

  get selectedPeriodStatus() {
    if (this.selectedPeriod === 'day') return this.dayBudgetStatus;
    if (this.selectedPeriod === 'week') return this.weekBudgetStatus;
    if (this.selectedPeriod === 'month') return this.monthBudgetStatus;
    return {
      budgetAmount: 0,
      spentAmount: this.totalYear,
      remainingAmount: 0,
      percentageUsed: 0,
      status: 'safe' as const,
      isOverBudget: false
    };
  }

  getCategoryOffset(index: number): number {
    let offset = 0;
    for (let i = 0; i < index; i++) {
      offset += this.getCategoryPercentage(this.categoryStats[i].total);
    }
    return (-502.4 * offset) / 100;
  }

  getCategoryPercentage(total: number): number {
    const totalExp = this.totalExpenses;
    return totalExp > 0 ? (total / totalExp) * 100 : 0;
  }

  getTrendBarHeight(total: number): number {
    const values = this.monthlyTrend.map((item) => item.total);
    const max = Math.max(...values, 0);
    if (max <= 0) return 0;
    const raw = (total / max) * 100;
    return Math.max(0, Math.min(raw, 100));
  }

  getCategoryColor(index: number): string {
    const colors = ['#4F46E5', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#6B7280'];
    return colors[index % colors.length];
  }

  getCategoryIcon(category: string): string {
    return this.categoryService.getCategoryIcon(category);
  }
}

