import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ExpenseService } from '../../services/expense.service';
import { BudgetLimitService } from '../../services/budget-limit.service';
import { CustomCurrencyPipe } from '../../pipes/custom-currency.pipe';

@Component({
  selector: 'app-dashboard',
  imports: [CommonModule, CustomCurrencyPipe],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent {
  selectedPeriod: 'day' | 'month' | 'year' = 'month';
  currentDate = new Date();

  constructor(public expenseService: ExpenseService, public budgetLimitService: BudgetLimitService) {}

  get totalToday() {
    return this.expenseService.getTotalByPeriod('day', this.currentDate);
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

  setPeriod(period: 'day' | 'month' | 'year') {
    this.selectedPeriod = period;
  }

  get totalExpenses() {
    return this.expenseService.getTotalExpenses();
  }

  get dailyLimit() {
    return this.budgetLimitService.getLimits()().daily;
  }

  get dailyProgress() {
    if (this.dailyLimit === 0) return 0;
    return (this.totalToday / this.dailyLimit) * 100;
  }

  isDailyLimitExceeded(): boolean {
    return this.dailyLimit > 0 && this.totalToday > this.dailyLimit;
  }

  getCategoryOffset(index: number): number {
    let offset = 0;
    for (let i = 0; i < index; i++) {
      offset += this.getCategoryPercentage(this.categoryStats[i].total);
    }
    return -502.4 * offset / 100;
  }

  getCategoryPercentage(total: number): number {
    const totalExp = this.totalExpenses;
    return totalExp > 0 ? (total / totalExp) * 100 : 0;
  }

  getCategoryColor(index: number): string {
    const colors = ['#4F46E5', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#6B7280'];
    return colors[index % colors.length];
  }

  getCategoryIcon(category: string): string {
    const icons: { [key: string]: string } = {
      'Alimentation': 'fas fa-utensils',
      'Transport': 'fas fa-car',
      'Loisirs': 'fas fa-gamepad',
      'Santé': 'fas fa-heartbeat',
      'Logement': 'fas fa-home',
      'Autre': 'fas fa-ellipsis-h'
    };
    return icons[category] || 'fas fa-circle';
  }
}
