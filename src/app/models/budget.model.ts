// src/app/models/budget.model.ts

export interface Budget {
  daily: number;
  weekly: number;
  monthly: number;
}

export interface BudgetStatus {
  budgetAmount: number;
  spentAmount: number;
  remainingAmount: number;
  percentageUsed: number;
  status: 'safe' | 'warning' | 'danger'; // vert, orange, rouge
  isOverBudget: boolean;
}

export const DEFAULT_BUDGET: Budget = {
  daily: 50,
  weekly: 350,
  monthly: 1500
};