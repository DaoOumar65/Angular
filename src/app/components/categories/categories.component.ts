import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ExpenseService } from '../../services/expense.service';
import { CategoryService } from '../../services/category.service';
import { CustomCurrencyPipe } from '../../pipes/custom-currency.pipe';
import { ExpenseCategory } from '../../models/expense.model';

@Component({
  selector: 'app-categories',
  imports: [CommonModule, CustomCurrencyPipe, FormsModule],
  templateUrl: './categories.component.html',
  styleUrl: './categories.component.scss'
})
export class CategoriesComponent {
  selectedCategory: string | null = null;
  editingCategory: ExpenseCategory | null = null;
  newCategoryName = '';
  editCategoryName = '';
  showAddForm = false;

  constructor(
    public expenseService: ExpenseService,
    public categoryService: CategoryService
  ) {}

  get categoryStats() {
    return this.expenseService.getExpensesByCategory();
  }

  get filteredExpenses() {
    if (!this.selectedCategory) return [];
    return this.expenseService.getExpenses()().filter((e) => e.category === this.selectedCategory);
  }

  selectCategory(category: string) {
    this.selectedCategory = this.selectedCategory === category ? null : category;
  }

  async addCategory() {
    if (!this.newCategoryName.trim()) {
      return;
    }

    const created = await this.categoryService.addCategory(this.newCategoryName.trim() as ExpenseCategory);
    if (created) {
      this.newCategoryName = '';
      this.showAddForm = false;
    }
  }

  startEdit(category: ExpenseCategory) {
    this.editingCategory = category;
    this.editCategoryName = category;
  }

  async saveEdit() {
    if (!this.editingCategory || !this.editCategoryName.trim()) {
      return;
    }

    const updated = await this.categoryService.updateCategory(
      this.editingCategory,
      this.editCategoryName.trim() as ExpenseCategory
    );

    if (updated) {
      this.editingCategory = null;
      this.editCategoryName = '';
      await this.expenseService.loadExpenses();
    }
  }

  cancelEdit() {
    this.editingCategory = null;
    this.editCategoryName = '';
  }

  async deleteCategory(category: ExpenseCategory) {
    if (!confirm(`Supprimer la categorie "${category}" ?`)) {
      return;
    }

    const result = await this.categoryService.deleteCategory(category);
    if (result.conflict) {
      alert('Impossible de supprimer une categorie par defaut.');
      return;
    }

    if (result.success) {
      await this.expenseService.loadExpenses();
    }
  }

  isDefaultCategory(category: ExpenseCategory): boolean {
    return this.categoryService.isDefaultCategory(category);
  }

  getCategoryIcon(category: string): string {
    return this.categoryService.getCategoryIcon(category);
  }
}
