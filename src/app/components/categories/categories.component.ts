import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ExpenseService } from '../../services/expense.service';
import { CustomCurrencyPipe } from '../../pipes/custom-currency.pipe';

@Component({
  selector: 'app-categories',
  imports: [CommonModule, CustomCurrencyPipe],
  templateUrl: './categories.component.html',
  styleUrl: './categories.component.scss'
})
export class CategoriesComponent {
  selectedCategory: string | null = null;

  constructor(public expenseService: ExpenseService) {}

  get categoryStats() {
    return this.expenseService.getExpensesByCategory();
  }

  get filteredExpenses() {
    if (!this.selectedCategory) return [];
    return this.expenseService.getExpenses()().filter(e => e.category === this.selectedCategory);
  }

  selectCategory(category: string) {
    this.selectedCategory = this.selectedCategory === category ? null : category;
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
