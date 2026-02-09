import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ExpenseService } from '../../services/expense.service';
import { CustomCurrencyPipe } from '../../pipes/custom-currency.pipe';

@Component({
  selector: 'app-expense-list',
  imports: [CommonModule, CustomCurrencyPipe],
  templateUrl: './expense-list.component.html',
  styleUrl: './expense-list.component.scss'
})
export class ExpenseListComponent {
  constructor(public expenseService: ExpenseService) {}

  get expenses() {
    return this.expenseService.getExpenses();
  }

  deleteExpense(id: string) {
    if (confirm('Voulez-vous vraiment supprimer cette dépense ?')) {
      this.expenseService.deleteExpense(id);
    }
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
