import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ExpenseService } from '../../services/expense.service';
import { CustomCurrencyPipe } from '../../pipes/custom-currency.pipe';

@Component({
  selector: 'app-analytics',
  imports: [CommonModule, CustomCurrencyPipe],
  templateUrl: './analytics.component.html',
  styleUrl: './analytics.component.scss'
})
export class AnalyticsComponent {
  constructor(public expenseService: ExpenseService) {}

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
    return stats.reduce((max, cat) => cat.total > max.total ? cat : max);
  }

  get comparison() {
    return this.expenseService.getComparison();
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

  getCategoryPercentage(total: number): number {
    if (this.totalExpenses === 0) return 0;
    return (total / this.totalExpenses) * 100;
  }
}
