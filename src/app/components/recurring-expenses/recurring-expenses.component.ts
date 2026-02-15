import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RecurringExpenseService } from '../../services/recurring-expense.service';
import { CategoryService } from '../../services/category.service';
import { RecurringExpense, RecurringFrequency } from '../../models/recurring-expense.model';

@Component({
  selector: 'app-recurring-expenses',
  imports: [CommonModule, FormsModule],
  templateUrl: './recurring-expenses.component.html',
  styleUrl: './recurring-expenses.component.scss'
})
export class RecurringExpensesComponent {
  showAddForm = false;
  editingRecurring: RecurringExpense | null = null;

  newRecurring = {
    description: '',
    amount: 0,
    category: '',
    frequency: 'monthly' as RecurringFrequency,
    startDate: new Date(),
    endDate: undefined as Date | undefined,
    isActive: true
  };

  constructor(
    public recurringService: RecurringExpenseService,
    public categoryService: CategoryService
  ) {}

  get recurringExpenses() {
    return this.recurringService.getRecurringExpenses()();
  }

  addRecurring() {
    if (this.newRecurring.description && this.newRecurring.amount > 0 && this.newRecurring.category) {
      this.recurringService.addRecurring(this.newRecurring);
      this.resetForm();
    }
  }

  toggleActive(id: string) {
    this.recurringService.toggleActive(id);
  }

  deleteRecurring(id: string) {
    if (confirm('Supprimer cette dépense récurrente ?')) {
      this.recurringService.deleteRecurring(id);
    }
  }

  resetForm() {
    this.newRecurring = {
      description: '',
      amount: 0,
      category: this.categoryService.getCategories()()[0],
      frequency: 'monthly',
      startDate: new Date(),
      endDate: undefined,
      isActive: true
    };
    this.showAddForm = false;
  }

  getFrequencyLabel(frequency: RecurringFrequency): string {
    const labels = {
      daily: 'Quotidien',
      weekly: 'Hebdomadaire',
      monthly: 'Mensuel',
      yearly: 'Annuel'
    };
    return labels[frequency];
  }
}
