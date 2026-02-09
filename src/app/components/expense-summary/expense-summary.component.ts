import { Component, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ExpenseService } from '../../services/expense.service';

@Component({
  selector: 'app-expense-summary',
  imports: [CommonModule],
  templateUrl: './expense-summary.component.html',
  styleUrl: './expense-summary.component.scss'
})
export class ExpenseSummaryComponent {
  constructor(public expenseService: ExpenseService) {}

  get expenses() {
    return this.expenseService.getExpenses();
  }

  get totalExpenses() {
    return this.expenseService.getTotalExpenses();
  }

  get expenseCount() {
    return this.expenses().length;
  }
}
