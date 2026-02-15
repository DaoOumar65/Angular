import { Component } from '@angular/core';
import { DashboardComponent } from '../../dashboard/dashboard.component';
import { ExpenseFormComponent } from '../../expense-form/expense-form.component';
import { ExpenseListComponent } from '../../expense-list/expense-list.component';

@Component({
  selector: 'app-dashboard-page',
  imports: [DashboardComponent, ExpenseFormComponent, ExpenseListComponent],
  templateUrl: './dashboard-page.component.html',
  styleUrl: './dashboard-page.component.scss'
})
export class DashboardPageComponent {}
