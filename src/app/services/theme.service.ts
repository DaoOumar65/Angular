import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private isDark = signal<boolean>(this.loadTheme());

  getTheme() {
    return this.isDark.asReadonly();
  }

  toggleTheme() {
    this.isDark.update(dark => !dark);
    this.applyTheme();
    this.saveTheme();
  }

  private applyTheme() {
    if (typeof document !== 'undefined') {
      document.body.classList.toggle('dark-theme', this.isDark());
    }
  }

  private saveTheme() {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('theme', this.isDark() ? 'dark' : 'light');
    }
  }

  private loadTheme(): boolean {
    if (typeof localStorage !== 'undefined') {
      const saved = localStorage.getItem('theme');
      const isDark = saved === 'dark';
      setTimeout(() => this.applyTheme(), 0);
      return isDark;
    }
    return false;
  }
}
