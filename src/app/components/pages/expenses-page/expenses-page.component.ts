import { Component } from '@angular/core';
import { ExpenseFormComponent } from '../../expense-form/expense-form.component';
import { ExpenseListComponent } from '../../expense-list/expense-list.component';

@Component({
  selector: 'app-expenses-page',
  imports: [ExpenseFormComponent, ExpenseListComponent],
  templateUrl: './expenses-page.component.html',
  styleUrl: './expenses-page.component.scss'
})
export class ExpensesPageComponent {}
