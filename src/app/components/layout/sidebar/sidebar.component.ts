import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-sidebar',
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss'
})
export class SidebarComponent {
  menuItems = [
    { path: '/dashboard', icon: 'fas fa-chart-line', label: 'Dashboard', exact: true },
    { path: '/expenses', icon: 'fas fa-money-bill-wave', label: 'Dépenses' },
    { path: '/incomes', icon: 'fas fa-coins', label: 'Revenus' },
    { path: '/recurring', icon: 'fas fa-sync-alt', label: 'Récurrentes' },
    { path: '/analytics', icon: 'fas fa-chart-pie', label: 'Analytiques' },
    { path: '/categories', icon: 'fas fa-tags', label: 'Catégories' },
    { path: '/notifications', icon: 'fas fa-bell', label: 'Notifications' },
    { path: '/settings', icon: 'fas fa-cog', label: 'Paramètres' }
  ];
}
