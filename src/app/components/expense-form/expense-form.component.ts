import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ExpenseService } from '../../services/expense.service';
import { CurrencyService } from '../../services/currency.service';
import { CategoryService } from '../../services/category.service';
import { ExpenseCategory } from '../../models/expense.model';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-expense-form',
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './expense-form.component.html',
  styleUrl: './expense-form.component.scss'
})
export class ExpenseFormComponent {
  expenseForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private expenseService: ExpenseService,
    public currencyService: CurrencyService,
    public categoryService: CategoryService
  ) {
    this.expenseForm = this.fb.group({
      description: ['', Validators.required],
      amount: [0, [Validators.required, Validators.min(0.01)]],
      category: [this.categoryService.getCategories()()[0], Validators.required],
      date: [new Date().toISOString().split('T')[0], Validators.required]
    });
  }

  onSubmit() {
    if (this.expenseForm.valid) {
      const formValue = this.expenseForm.value;
      const currentCurrency = this.currencyService.getCurrentCurrency()();
      const amountInEUR = Number(formValue.amount) / currentCurrency.rate;
      
      // Vérifier le plafond journalier
      const dailyLimit = this.currencyService.getCurrentCurrency()().rate * 
                         (typeof localStorage !== 'undefined' ? 
                          JSON.parse(localStorage.getItem('budgetLimits') || '{"daily":0}').daily : 0);
      
      if (dailyLimit > 0) {
        const todayTotal = this.expenseService.getTotalByPeriod('day', new Date());
        const newTotal = todayTotal + amountInEUR;
        const dailyLimitEUR = dailyLimit / currentCurrency.rate;
        
        if (newTotal > dailyLimitEUR) {
          const exceeded = (newTotal - dailyLimitEUR) * currentCurrency.rate;
          const confirmMsg = `⚠️ ATTENTION : Cette dépense dépasse votre plafond journalier de ${exceeded.toFixed(0)} ${currentCurrency.symbol}.\n\nVoulez-vous quand même l'enregistrer ?`;
          
          if (!confirm(confirmMsg)) {
            return;
          }
        }
      }
      
      this.expenseService.addExpense({
        description: formValue.description,
        amount: amountInEUR,
        category: formValue.category,
        date: new Date(formValue.date)
      });
      this.expenseForm.reset({
        description: '',
        amount: 0,
        category: this.categoryService.getCategories()()[0],
        date: new Date().toISOString().split('T')[0]
      });
    }
  }
}
