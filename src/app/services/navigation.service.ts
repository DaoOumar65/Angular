import { Injectable, signal } from '@angular/core';

export type ViewType = 'dashboard' | 'expenses' | 'analytics' | 'categories' | 'settings';

@Injectable({
  providedIn: 'root'
})
export class NavigationService {
  private currentView = signal<ViewType>('dashboard');

  getCurrentView() {
    return this.currentView.asReadonly();
  }

  setView(view: ViewType) {
    this.currentView.set(view);
  }
}
