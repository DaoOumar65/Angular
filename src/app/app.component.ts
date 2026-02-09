import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavbarComponent } from './components/layout/navbar/navbar.component';
import { SidebarComponent } from './components/layout/sidebar/sidebar.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { ExpenseFormComponent } from './components/expense-form/expense-form.component';
import { ExpenseListComponent } from './components/expense-list/expense-list.component';
import { AnalyticsComponent } from './components/analytics/analytics.component';
import { CategoriesComponent } from './components/categories/categories.component';
import { SettingsComponent } from './components/settings/settings.component';
import { AuthComponent } from './components/auth/auth.component';
import { NavigationService } from './services/navigation.service';
import { AuthService } from './services/auth.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  imports: [
    CommonModule,
    RouterOutlet, 
    NavbarComponent, 
    SidebarComponent, 
    DashboardComponent,
    ExpenseFormComponent, 
    ExpenseListComponent,
    AnalyticsComponent,
    CategoriesComponent,
    SettingsComponent,
    AuthComponent
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'Budget Tracker Pro';

  constructor(
    public navigationService: NavigationService,
    public authService: AuthService
  ) {}

  get currentView() {
    return this.navigationService.getCurrentView();
  }

  get isAuthenticated() {
    return this.authService.isAuthenticated();
  }
}
