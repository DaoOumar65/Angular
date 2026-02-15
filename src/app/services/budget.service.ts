import { Injectable, computed, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { Budget, BudgetStatus, DEFAULT_BUDGET } from '../models/budget.model';
import { API_BASE_URL } from '../config/api.config';
import { StorageService } from './storage.service';

interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
}

interface ApiBudget {
  daily: number;
  weekly: number;
  monthly: number;
  monthly_savings_goal: number;
}

@Injectable({
  providedIn: 'root'
})
export class BudgetService {
  private readonly http = inject(HttpClient);
  private readonly storageService = inject(StorageService);
  private readonly storageKey = 'budget_cache';

  private budget = signal<Budget>(this.loadBudgetCache());
  private monthlySavingsGoal = signal<number>(this.loadGoalCache());

  getBudget() {
    return this.budget.asReadonly();
  }

  getMonthlySavingsGoal() {
    return this.monthlySavingsGoal.asReadonly();
  }

  budgetTotal = computed(() => {
    const current = this.budget();
    return current.daily + current.weekly + current.monthly;
  });

  async loadBudget(): Promise<void> {
    try {
      const response = await firstValueFrom(
        this.http.get<ApiResponse<ApiBudget>>(`${API_BASE_URL}/budget`)
      );

      this.applyBudgetFromApi(response.data);
    } catch {
      // Keep cached budget on transient backend errors.
    }
  }

  async updateBudget(patch: Partial<Budget>): Promise<void> {
    const current = this.budget();
    const next: Budget = {
      daily: this.normalizeAmount(patch.daily ?? current.daily),
      weekly: this.normalizeAmount(patch.weekly ?? current.weekly),
      monthly: this.normalizeAmount(patch.monthly ?? current.monthly)
    };

    const goal = this.monthlySavingsGoal();

    await firstValueFrom(
      this.http.put(`${API_BASE_URL}/budget`, {
        daily: next.daily,
        weekly: next.weekly,
        monthly: next.monthly,
        monthly_savings_goal: goal
      })
    );

    this.budget.set(next);
    this.saveBudgetCache();
  }

  async resetBudget(): Promise<void> {
    this.budget.set({ ...DEFAULT_BUDGET });
    this.monthlySavingsGoal.set(0);
    await this.syncBudget();
  }

  async setMonthlySavingsGoal(goal: number): Promise<void> {
    const normalized = this.normalizeAmount(goal);
    this.monthlySavingsGoal.set(normalized);
    await this.syncBudget();
  }

  getBudgetStatus(period: keyof Budget, spentAmount: number): BudgetStatus {
    const budgetAmount = this.budget()[period];
    const remainingAmount = budgetAmount - spentAmount;
    const percentageUsed = budgetAmount > 0 ? (spentAmount / budgetAmount) * 100 : 0;

    const status: BudgetStatus['status'] =
      percentageUsed >= 100 ? 'danger' : percentageUsed >= 80 ? 'warning' : 'safe';

    return {
      budgetAmount,
      spentAmount,
      remainingAmount,
      percentageUsed,
      status,
      isOverBudget: remainingAmount < 0
    };
  }

  private async syncBudget(): Promise<void> {
    const budget = this.budget();
    const goal = this.monthlySavingsGoal();

    await firstValueFrom(
      this.http.put(`${API_BASE_URL}/budget`, {
        daily: budget.daily,
        weekly: budget.weekly,
        monthly: budget.monthly,
        monthly_savings_goal: goal
      })
    );

    this.saveBudgetCache();
  }

  private normalizeAmount(value: number): number {
    return Number.isFinite(value) && value >= 0 ? value : 0;
  }

  private applyBudgetFromApi(data: ApiBudget) {
    this.budget.set({
      daily: Number(data.daily) || 0,
      weekly: Number(data.weekly) || 0,
      monthly: Number(data.monthly) || 0
    });
    this.monthlySavingsGoal.set(Number(data.monthly_savings_goal) || 0);
    this.saveBudgetCache();
  }

  private loadBudgetCache(): Budget {
    return this.storageService.getJson<Budget>(this.storageKey, { ...DEFAULT_BUDGET });
  }

  private loadGoalCache(): number {
    const cached = this.storageService.getJson<any>(this.storageKey, null);
    return Number(cached?.monthly_savings_goal || 0);
  }

  private saveBudgetCache() {
    this.storageService.setJson(this.storageKey, {
      ...this.budget(),
      monthly_savings_goal: this.monthlySavingsGoal()
    });
  }
}
