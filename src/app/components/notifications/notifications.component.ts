import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NotificationService } from '../../services/notification.service';

@Component({
  selector: 'app-notifications',
  imports: [CommonModule],
  templateUrl: './notifications.component.html',
  styleUrl: './notifications.component.scss'
})
export class NotificationsComponent {
  constructor(public notificationService: NotificationService) {}

  get notifications() {
    return this.notificationService.getNotifications()();
  }

  get unreadCount() {
    return this.notificationService.getUnreadCount();
  }

  markAsRead(id: string) {
    this.notificationService.markAsRead(id);
  }

  markAllAsRead() {
    this.notificationService.markAllAsRead();
  }

  deleteNotification(id: string) {
    this.notificationService.deleteNotification(id);
  }

  clearAll() {
    if (confirm('Supprimer toutes les notifications ?')) {
      this.notificationService.clearAll();
    }
  }

  getIcon(type: string): string {
    const icons = {
      warning: 'fas fa-exclamation-triangle',
      info: 'fas fa-info-circle',
      success: 'fas fa-check-circle',
      error: 'fas fa-times-circle'
    };
    return icons[type as keyof typeof icons] || 'fas fa-bell';
  }
}
