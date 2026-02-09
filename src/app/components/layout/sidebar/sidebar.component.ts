import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavigationService } from '../../../services/navigation.service';

@Component({
  selector: 'app-sidebar',
  imports: [CommonModule],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss'
})
export class SidebarComponent {
  menuItems = [
    { id: 'dashboard', icon: 'fas fa-chart-line', label: 'Dashboard' },
    { id: 'expenses', icon: 'fas fa-money-bill-wave', label: 'Dépenses' },
    { id: 'analytics', icon: 'fas fa-chart-pie', label: 'Analytiques' },
    { id: 'categories', icon: 'fas fa-tags', label: 'Catégories' },
    { id: 'settings', icon: 'fas fa-cog', label: 'Paramètres' }
  ];

  constructor(public navigationService: NavigationService) {}

  get currentView() {
    return this.navigationService.getCurrentView();
  }

  selectMenu(menuId: string) {
    this.navigationService.setView(menuId as any);
  }

  isActive(menuId: string): boolean {
    return this.currentView() === menuId;
  }
}
