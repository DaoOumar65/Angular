import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ExpenseService } from '../../services/expense.service';
import { BudgetLimitService } from '../../services/budget-limit.service';

@Component({
  selector: 'app-settings',
  imports: [CommonModule, FormsModule],
  templateUrl: './settings.component.html',
  styleUrl: './settings.component.scss'
})
export class SettingsComponent {
  currentDate = new Date();
  dailyLimit = 0;

  constructor(private expenseService: ExpenseService, private budgetLimitService: BudgetLimitService) {
    this.dailyLimit = this.budgetLimitService.getLimits()().daily;
  }

  get totalExpenses() {
    return this.expenseService.getExpenses()().length;
  }

  exportData() {
    const data = this.expenseService.getExpenses()();
    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `budget-tracker-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    window.URL.revokeObjectURL(url);
  }

  saveDailyLimit() {
    this.budgetLimitService.setDailyLimit(this.dailyLimit);
  }

  clearAllData() {
    if (confirm('Êtes-vous sûr de vouloir supprimer toutes les données ? Cette action est irréversible.')) {
      localStorage.removeItem('expenses');
      window.location.reload();
    }
  }
}
