import { Injectable, signal } from '@angular/core';

export interface BudgetLimit {
  daily: number;
  monthly: number;
  yearly: number;
}

@Injectable({
  providedIn: 'root'
})
export class BudgetLimitService {
  private limits = signal<BudgetLimit>(this.loadLimits());

  getLimits() {
    return this.limits.asReadonly();
  }

  setDailyLimit(amount: number) {
    this.limits.update(limits => ({ ...limits, daily: amount }));
    this.saveLimits();
  }

  setMonthlyLimit(amount: number) {
    this.limits.update(limits => ({ ...limits, monthly: amount }));
    this.saveLimits();
  }

  setYearlyLimit(amount: number) {
    this.limits.update(limits => ({ ...limits, yearly: amount }));
    this.saveLimits();
  }

  private saveLimits() {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('budgetLimits', JSON.stringify(this.limits()));
    }
  }

  private loadLimits(): BudgetLimit {
    if (typeof localStorage !== 'undefined') {
      const saved = localStorage.getItem('budgetLimits');
      if (saved) {
        return JSON.parse(saved);
      }
    }
    return { daily: 0, monthly: 0, yearly: 0 };
  }
}
