import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavbarComponent } from '../navbar/navbar.component';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { CategoryService } from '../../../services/category.service';
import { ExpenseService } from '../../../services/expense.service';
import { BudgetService } from '../../../services/budget.service';
import { CurrencyService } from '../../../services/currency.service';
import { ThemeService } from '../../../services/theme.service';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-shell',
  imports: [RouterOutlet, NavbarComponent, SidebarComponent],
  templateUrl: './app-shell.component.html',
  styleUrl: './app-shell.component.scss'
})
export class AppShellComponent {
  private readonly categoryService = inject(CategoryService);
  private readonly expenseService = inject(ExpenseService);
  private readonly budgetService = inject(BudgetService);
  private readonly currencyService = inject(CurrencyService);
  private readonly themeService = inject(ThemeService);
  private readonly authService = inject(AuthService);

  constructor() {
    this.hydrate();
  }

  private async hydrate() {
    if (!this.authService.hasToken()) {
      return;
    }

    await this.authService.refreshCurrentUser();
    if (!this.authService.isAuthenticated()) {
      return;
    }

    await Promise.all([
      this.categoryService.loadCategories(),
      this.expenseService.loadExpenses(),
      this.budgetService.loadBudget(),
      this.currencyService.syncPreferencesFromApi(),
      this.themeService.syncPreferencesFromApi()
    ]);
  }
}
