import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IncomeService } from '../../services/income.service';
import { CustomCurrencyPipe } from '../../pipes/custom-currency.pipe';
import { Income } from '../../models/income.model';

@Component({
  selector: 'app-incomes',
  imports: [CommonModule, FormsModule, CustomCurrencyPipe],
  templateUrl: './incomes.component.html',
  styleUrl: './incomes.component.scss'
})
export class IncomesComponent {
  showAddForm = false;
  editingIncome: Income | null = null;

  newIncome = {
    description: '',
    amount: 0,
    source: '',
    date: new Date(),
    isRecurring: false
  };

  constructor(public incomeService: IncomeService) {}

  get incomes() {
    return this.incomeService.getIncomes()();
  }

  get totalIncome() {
    return this.incomeService.getTotalIncome();
  }

  get monthlyIncome() {
    return this.incomeService.getIncomeByPeriod('month');
  }

  addIncome() {
    if (this.newIncome.description && this.newIncome.amount > 0) {
      this.incomeService.addIncome(this.newIncome);
      this.resetForm();
    }
  }

  editIncome(income: Income) {
    this.editingIncome = { ...income };
  }

  saveEdit() {
    if (this.editingIncome) {
      this.incomeService.updateIncome(this.editingIncome.id, {
        description: this.editingIncome.description,
        amount: this.editingIncome.amount,
        source: this.editingIncome.source,
        date: this.editingIncome.date,
        isRecurring: this.editingIncome.isRecurring
      });
      this.editingIncome = null;
    }
  }

  cancelEdit() {
    this.editingIncome = null;
  }

  deleteIncome(id: string) {
    if (confirm('Supprimer ce revenu ?')) {
      this.incomeService.deleteIncome(id);
    }
  }

  resetForm() {
    this.newIncome = {
      description: '',
      amount: 0,
      source: '',
      date: new Date(),
      isRecurring: false
    };
    this.showAddForm = false;
  }
}
