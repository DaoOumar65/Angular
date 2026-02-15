import { Injectable, signal } from '@angular/core';
import { Notification, NotificationType } from '../models/notification.model';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private notifications = signal<Notification[]>(this.loadNotifications());

  getNotifications() {
    return this.notifications.asReadonly();
  }

  getUnreadCount() {
    return this.notifications().filter(n => !n.isRead).length;
  }

  addNotification(type: NotificationType, title: string, message: string, action?: string, actionData?: any) {
    const notification: Notification = {
      id: crypto.randomUUID(),
      type,
      title,
      message,
      date: new Date(),
      isRead: false,
      action,
      actionData
    };
    this.notifications.update(list => [notification, ...list]);
    this.saveNotifications();
  }

  markAsRead(id: string) {
    this.notifications.update(list =>
      list.map(n => n.id === id ? { ...n, isRead: true } : n)
    );
    this.saveNotifications();
  }

  markAllAsRead() {
    this.notifications.update(list =>
      list.map(n => ({ ...n, isRead: true }))
    );
    this.saveNotifications();
  }

  deleteNotification(id: string) {
    this.notifications.update(list => list.filter(n => n.id !== id));
    this.saveNotifications();
  }

  clearAll() {
    this.notifications.set([]);
    this.saveNotifications();
  }

  private saveNotifications() {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('notifications', JSON.stringify(this.notifications()));
    }
  }

  private loadNotifications(): Notification[] {
    if (typeof localStorage !== 'undefined') {
      const saved = localStorage.getItem('notifications');
      if (saved) {
        return JSON.parse(saved).map((n: any) => ({
          ...n,
          date: new Date(n.date)
        }));
      }
    }
    return [];
  }
}
