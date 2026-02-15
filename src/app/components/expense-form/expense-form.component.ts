import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ExpenseService } from '../../services/expense.service';
import { CurrencyService } from '../../services/currency.service';
import { CategoryService } from '../../services/category.service';
import { BudgetService } from '../../services/budget.service';

@Component({
  selector: 'app-expense-form',
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './expense-form.component.html',
  styleUrl: './expense-form.component.scss'
})
export class ExpenseFormComponent {
  expenseForm: FormGroup;
  maxDate = new Date().toISOString().split('T')[0];
  submitError = '';
  submitSuccess = '';

  constructor(
    private fb: FormBuilder,
    private expenseService: ExpenseService,
    public currencyService: CurrencyService,
    public categoryService: CategoryService,
    private budgetService: BudgetService
  ) {
    this.expenseForm = this.fb.group({
      description: ['', [Validators.required, Validators.maxLength(100)]],
      amount: [0, [Validators.required, Validators.min(0.01), Validators.max(10000000)]],
      category: [this.categoryService.getCategories()()[0] || 'Autre', Validators.required],
      date: [new Date().toISOString().split('T')[0], Validators.required],
      recurrence: ['none'],
      recurrenceEndDate: ['']
    });
  }

  async onSubmit() {
    this.submitError = '';
    this.submitSuccess = '';

    if (this.expenseForm.invalid) {
      return;
    }

    const formValue = this.expenseForm.value;
    const expenseDate = new Date(formValue.date);
    if (expenseDate > new Date(this.maxDate)) {
      return;
    }

    const amountInFcfa = this.roundAmount(this.currencyService.convertDisplayToStorage(Number(formValue.amount)));
    const entries = this.buildRecurringEntries(
      {
        description: formValue.description.trim(),
        amount: amountInFcfa,
        category: formValue.category,
        date: expenseDate
      },
      formValue.recurrence,
      formValue.recurrenceEndDate ? new Date(formValue.recurrenceEndDate) : null
    );

    if (entries.length === 0) {
      return;
    }

    const firstDate = entries[0].date;
    const dailyStatus = this.budgetService.getBudgetStatus(
      'daily',
      this.expenseService.getTotalByPeriod('day', firstDate) + entries.filter((e) => this.isSameDay(e.date, firstDate)).reduce((sum, e) => sum + e.amount, 0)
    );
    const monthlyStatus = this.budgetService.getBudgetStatus(
      'monthly',
      this.expenseService.getTotalByPeriod('month', firstDate) + entries.filter((e) => this.isSameMonth(e.date, firstDate)).reduce((sum, e) => sum + e.amount, 0)
    );

    if (dailyStatus.isOverBudget || monthlyStatus.isOverBudget) {
      const confirmMessage =
        'Attention: cette operation depasse un budget configure (jour ou mois). Voulez-vous continuer ?';
      if (!confirm(confirmMessage)) {
        return;
      }
    }

    try {
      await this.expenseService.addExpenses(entries);
      this.submitSuccess = entries.length > 1 ? `${entries.length} depenses ajoutees.` : 'Depense ajoutee.';
      this.expenseForm.reset({
        description: '',
        amount: 0,
        category: this.categoryService.getCategories()()[0] || 'Autre',
        date: new Date().toISOString().split('T')[0],
        recurrence: 'none',
        recurrenceEndDate: ''
      });
    } catch (error: any) {
      this.submitError = this.extractErrorMessage(error);
    }
  }

  private buildRecurringEntries(
    base: { description: string; amount: number; category: string; date: Date },
    recurrence: 'none' | 'daily' | 'weekly' | 'monthly',
    recurrenceEndDate: Date | null
  ): { description: string; amount: number; category: string; date: Date }[] {
    const entries: { description: string; amount: number; category: string; date: Date }[] = [
      {
        description: base.description,
        amount: base.amount,
        category: base.category,
        date: new Date(base.date)
      }
    ];

    if (recurrence === 'none' || !recurrenceEndDate) {
      return entries;
    }

    const limit = new Date(recurrenceEndDate);
    limit.setHours(0, 0, 0, 0);

    let cursor = new Date(base.date);
    let safetyCount = 0;

    while (safetyCount < 366) {
      if (recurrence === 'daily') cursor.setDate(cursor.getDate() + 1);
      if (recurrence === 'weekly') cursor.setDate(cursor.getDate() + 7);
      if (recurrence === 'monthly') cursor.setMonth(cursor.getMonth() + 1);

      if (cursor >= limit) {
        break;
      }

      entries.push({
        description: base.description,
        amount: base.amount,
        category: base.category,
        date: new Date(cursor)
      });

      safetyCount += 1;
    }

    return entries;
  }

  private isSameDay(left: Date, right: Date): boolean {
    return left.toDateString() === right.toDateString();
  }

  private isSameMonth(left: Date, right: Date): boolean {
    return left.getMonth() === right.getMonth() && left.getFullYear() === right.getFullYear();
  }

  private roundAmount(value: number): number {
    return Math.round((value + Number.EPSILON) * 1_000_000) / 1_000_000;
  }

  private extractErrorMessage(error: any): string {
    if (typeof error?.message === 'string' && error.message.trim()) {
      return error.message;
    }

    const message = error?.error?.message;
    if (typeof message === 'string' && message.trim()) {
      return message;
    }

    const errors = error?.error?.errors;
    if (errors && typeof errors === 'object') {
      const firstField = Object.keys(errors)[0];
      const firstMessage = errors[firstField]?.[0];
      if (firstMessage) {
        return String(firstMessage);
      }
    }

    return 'Impossible d ajouter la depense. Verifiez les champs saisis.';
  }
}

