import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ExpenseService } from '../../services/expense.service';
import { CategoryService } from '../../services/category.service';
import { CustomCurrencyPipe } from '../../pipes/custom-currency.pipe';
import { Expense } from '../../models/expense.model';

@Component({
  selector: 'app-expense-list',
  imports: [CommonModule, CustomCurrencyPipe, FormsModule],
  templateUrl: './expense-list.component.html',
  styleUrl: './expense-list.component.scss'
})
export class ExpenseListComponent {
  editingExpense: Expense | null = null;
  searchTerm = '';
  selectedCategory = '';
  sortBy: 'date' | 'amount' | 'category' = 'date';
  startDate = '';
  endDate = '';
  minAmount: number | null = null;
  maxAmount: number | null = null;

  pageSize = 20;
  currentPage = 1;

  constructor(public expenseService: ExpenseService, public categoryService: CategoryService) {}

  get filteredExpenses(): Expense[] {
    let filtered = [...this.expenseService.getExpenses()()];

    if (this.searchTerm.trim()) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter((e) => e.description.toLowerCase().includes(term));
    }

    if (this.selectedCategory) {
      filtered = filtered.filter((e) => e.category === this.selectedCategory);
    }

    if (this.startDate) {
      const start = new Date(this.startDate);
      filtered = filtered.filter((e) => new Date(e.date) >= start);
    }

    if (this.endDate) {
      const end = new Date(this.endDate);
      end.setHours(23, 59, 59, 999);
      filtered = filtered.filter((e) => new Date(e.date) <= end);
    }

    if (this.minAmount !== null && this.minAmount >= 0) {
      filtered = filtered.filter((e) => e.amount >= this.minAmount!);
    }

    if (this.maxAmount !== null && this.maxAmount >= 0) {
      filtered = filtered.filter((e) => e.amount <= this.maxAmount!);
    }

    return filtered.sort((a, b) => {
      if (this.sortBy === 'date') {
        return new Date(b.date).getTime() - new Date(a.date).getTime();
      }
      if (this.sortBy === 'category') {
        return a.category.localeCompare(b.category);
      }
      return b.amount - a.amount;
    });
  }

  get totalPages(): number {
    return Math.max(1, Math.ceil(this.filteredExpenses.length / this.pageSize));
  }

  get expenses(): Expense[] {
    if (this.currentPage > this.totalPages) {
      this.currentPage = this.totalPages;
    }

    const start = (this.currentPage - 1) * this.pageSize;
    return this.filteredExpenses.slice(start, start + this.pageSize);
  }

  onFiltersChanged() {
    this.currentPage = 1;
  }

  nextPage() {
    if (this.currentPage < this.totalPages) {
      this.currentPage += 1;
    }
  }

  previousPage() {
    if (this.currentPage > 1) {
      this.currentPage -= 1;
    }
  }

  resetFilters() {
    this.searchTerm = '';
    this.selectedCategory = '';
    this.startDate = '';
    this.endDate = '';
    this.minAmount = null;
    this.maxAmount = null;
    this.sortBy = 'date';
    this.currentPage = 1;
  }

  async deleteExpense(id: string) {
    if (confirm('Voulez-vous vraiment supprimer cette depense ?')) {
      await this.expenseService.deleteExpense(id);
    }
  }

  editExpense(expense: Expense) {
    this.editingExpense = {
      ...expense,
      date: typeof expense.date === 'string' ? expense.date : expense.date.toISOString().split('T')[0]
    } as any;
  }

  cancelEdit() {
    this.editingExpense = null;
  }

  async saveEdit() {
    if (this.editingExpense) {
      const dateValue =
        typeof this.editingExpense.date === 'string'
          ? new Date(this.editingExpense.date)
          : this.editingExpense.date;

      await this.expenseService.updateExpense(this.editingExpense.id, {
        description: this.editingExpense.description,
        amount: this.editingExpense.amount,
        category: this.editingExpense.category,
        date: dateValue
      });
      this.editingExpense = null;
    }
  }

  getCategoryIcon(category: string): string {
    return this.categoryService.getCategoryIcon(category);
  }
}

