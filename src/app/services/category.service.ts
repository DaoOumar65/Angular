import { Injectable, signal } from '@angular/core';
import { ExpenseCategory } from '../models/expense.model';

@Injectable({
  providedIn: 'root'
})
export class CategoryService {
  private defaultCategories: ExpenseCategory[] = ['Alimentation', 'Transport', 'Loisirs', 'Santé', 'Logement', 'Autre'];
  private categories = signal<ExpenseCategory[]>(this.loadCategories());

  getCategories() {
    return this.categories.asReadonly();
  }

  addCategory(category: ExpenseCategory) {
    if (!this.categories().includes(category)) {
      this.categories.update(cats => [...cats, category]);
      this.saveCategories();
    }
  }

  updateCategory(oldCategory: ExpenseCategory, newCategory: ExpenseCategory) {
    this.categories.update(cats => 
      cats.map(c => c === oldCategory ? newCategory : c)
    );
    this.saveCategories();
  }

  deleteCategory(category: ExpenseCategory) {
    if (!this.defaultCategories.includes(category)) {
      this.categories.update(cats => cats.filter(c => c !== category));
      this.saveCategories();
    }
  }

  isDefaultCategory(category: ExpenseCategory): boolean {
    return this.defaultCategories.includes(category);
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
    return icons[category] || 'fas fa-tag';
  }

  private saveCategories() {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('categories', JSON.stringify(this.categories()));
    }
  }

  private loadCategories(): ExpenseCategory[] {
    if (typeof localStorage !== 'undefined') {
      const saved = localStorage.getItem('categories');
      if (saved) {
        return JSON.parse(saved);
      }
    }
    return [...this.defaultCategories];
  }
}
