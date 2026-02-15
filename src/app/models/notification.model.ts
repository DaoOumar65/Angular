export type NotificationType = 'warning' | 'info' | 'success' | 'error';

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  date: Date;
  isRead: boolean;
  action?: string;
  actionData?: any;
}
