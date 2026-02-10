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
  sortBy: 'date' | 'amount' = 'date';

  constructor(public expenseService: ExpenseService, public categoryService: CategoryService) {}

  get expenses() {
    let filtered = this.expenseService.getExpenses()();
    
    if (this.searchTerm) {
      filtered = filtered.filter(e => 
        e.description.toLowerCase().includes(this.searchTerm.toLowerCase())
      );
    }
    
    if (this.selectedCategory) {
      filtered = filtered.filter(e => e.category === this.selectedCategory);
    }
    
    return filtered.sort((a, b) => {
      if (this.sortBy === 'date') {
        return new Date(b.date).getTime() - new Date(a.date).getTime();
      }
      return b.amount - a.amount;
    });
  }

  deleteExpense(id: string) {
    if (confirm('Voulez-vous vraiment supprimer cette dépense ?')) {
      this.expenseService.deleteExpense(id);
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

  saveEdit() {
    if (this.editingExpense) {
      const dateValue = typeof this.editingExpense.date === 'string' 
        ? new Date(this.editingExpense.date)
        : this.editingExpense.date;
        
      this.expenseService.updateExpense(this.editingExpense.id, {
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
