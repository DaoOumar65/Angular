import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ExpenseService, ExpenseImportRow } from '../../services/expense.service';
import { BudgetService } from '../../services/budget.service';
import { StorageService } from '../../services/storage.service';
import { CategoryService } from '../../services/category.service';

@Component({
  selector: 'app-settings',
  imports: [CommonModule, FormsModule],
  templateUrl: './settings.component.html',
  styleUrl: './settings.component.scss'
})
export class SettingsComponent {
  currentDate = new Date();
  dailyBudget = 0;
  weeklyBudget = 0;
  monthlyBudget = 0;
  savingsGoal = 0;
  importStatus = '';
  importError = '';

  constructor(
    private expenseService: ExpenseService,
    private budgetService: BudgetService,
    private storageService: StorageService,
    private categoryService: CategoryService
  ) {
    const budget = this.budgetService.getBudget()();
    this.dailyBudget = budget.daily;
    this.weeklyBudget = budget.weekly;
    this.monthlyBudget = budget.monthly;
    this.savingsGoal = this.budgetService.getMonthlySavingsGoal()();
  }

  get totalExpenses() {
    return this.expenseService.getExpenses()().length;
  }

  async saveBudgetSettings() {
    await this.budgetService.updateBudget({
      daily: this.dailyBudget,
      weekly: this.weeklyBudget,
      monthly: this.monthlyBudget
    });
    await this.budgetService.setMonthlySavingsGoal(this.savingsGoal);
    this.importStatus = 'Budgets et objectif d epargne enregistres.';
    this.importError = '';
  }

  exportData() {
    const payload = {
      exportedAt: new Date().toISOString(),
      expenses: this.expenseService.getExpenses()(),
      budget: this.budgetService.getBudget()(),
      savingsGoal: this.budgetService.getMonthlySavingsGoal()()
    };

    this.downloadBlob(
      new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' }),
      `budget-tracker-${new Date().toISOString().split('T')[0]}.json`
    );
  }

  exportCsv() {
    const rows = this.expenseService.getExpenses()();
    const header = 'description,amount,category,date';
    const content = rows
      .map((row) => {
        const description = `"${String(row.description).replace(/"/g, '""')}"`;
        const amount = row.amount.toFixed(2);
        const category = `"${String(row.category).replace(/"/g, '""')}"`;
        const date = new Date(row.date).toISOString().split('T')[0];
        return [description, amount, category, date].join(',');
      })
      .join('\n');

    this.downloadBlob(
      new Blob([`${header}\n${content}`], { type: 'text/csv;charset=utf-8;' }),
      `budget-tracker-${new Date().toISOString().split('T')[0]}.csv`
    );
  }

  async importData(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    this.importStatus = '';
    this.importError = '';

    if (!file) {
      return;
    }

    try {
      const text = await file.text();
      if (file.name.toLowerCase().endsWith('.json')) {
        await this.importJson(text);
      } else if (file.name.toLowerCase().endsWith('.csv')) {
        await this.importCsv(text);
      } else {
        this.importError = 'Format non supporte. Utilisez .json ou .csv';
      }
    } catch {
      this.importError = 'Impossible de lire le fichier.';
    } finally {
      input.value = '';
    }
  }

  clearAllData() {
    if (confirm('Etes-vous sur de vouloir supprimer toutes les donnees ? Cette action est irreversible.')) {
      this.storageService.clearKeys([
        'expenses',
        'budgetLimits',
        'budget',
        'savingsGoal',
        'categories',
        'currency',
        'theme',
        'currentUser',
        'users',
        'auth_token'
      ]);
      window.location.reload();
    }
  }

  private async importJson(content: string) {
    const parsed = JSON.parse(content);

    const rows: ExpenseImportRow[] = Array.isArray(parsed)
      ? parsed.map((row: any) => this.toImportRow(row)).filter(Boolean)
      : (parsed.expenses || []).map((row: any) => this.toImportRow(row)).filter(Boolean);

    if (rows.length > 0) {
      await this.expenseService.importExpenses(rows);
      for (const row of rows) {
        await this.categoryService.addCategory(row.category);
      }
    }

    if (parsed.budget) {
      await this.budgetService.updateBudget({
        daily: Number(parsed.budget.daily) || 0,
        weekly: Number(parsed.budget.weekly) || 0,
        monthly: Number(parsed.budget.monthly) || 0
      });
    }

    if (parsed.savingsGoal !== undefined) {
      await this.budgetService.setMonthlySavingsGoal(Number(parsed.savingsGoal) || 0);
    }

    this.importStatus = `${rows.length} depense(s) importee(s).`;
  }

  private async importCsv(content: string) {
    const lines = content
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter(Boolean);

    if (lines.length < 2) {
      this.importError = 'Fichier CSV vide.';
      return;
    }

    const rows: ExpenseImportRow[] = [];
    for (let i = 1; i < lines.length; i++) {
      const columns = this.parseCsvLine(lines[i]);
      if (columns.length < 4) continue;

      const row = this.toImportRow({
        description: columns[0],
        amount: columns[1],
        category: columns[2],
        date: columns[3]
      });

      if (row) {
        rows.push(row);
      }
    }

    if (rows.length === 0) {
      this.importError = 'Aucune ligne valide dans le CSV.';
      return;
    }

    await this.expenseService.importExpenses(rows);
    for (const row of rows) {
      await this.categoryService.addCategory(row.category);
    }
    this.importStatus = `${rows.length} depense(s) importee(s).`;
  }

  private parseCsvLine(line: string): string[] {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      const next = line[i + 1];

      if (char === '"' && inQuotes && next === '"') {
        current += '"';
        i++;
        continue;
      }

      if (char === '"') {
        inQuotes = !inQuotes;
        continue;
      }

      if (char === ',' && !inQuotes) {
        result.push(current.trim());
        current = '';
        continue;
      }

      current += char;
    }

    result.push(current.trim());
    return result;
  }

  private toImportRow(row: any): ExpenseImportRow | null {
    const description = String(row.description || '').trim();
    const category = String(row.category || '').trim() || 'Autre';
    const amount = Number(row.amount);
    const date = new Date(row.date);

    if (!description || !Number.isFinite(amount) || amount <= 0 || isNaN(date.getTime())) {
      return null;
    }

    return { description, amount, category, date };
  }

  private downloadBlob(blob: Blob, filename: string) {
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    window.URL.revokeObjectURL(url);
  }
}

