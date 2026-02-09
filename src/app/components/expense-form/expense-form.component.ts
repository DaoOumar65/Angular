import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ExpenseService } from '../../services/expense.service';
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
  categories: ExpenseCategory[] = ['Alimentation', 'Transport', 'Loisirs', 'Santé', 'Logement', 'Autre'];

  constructor(
    private fb: FormBuilder,
    private expenseService: ExpenseService
  ) {
    this.expenseForm = this.fb.group({
      description: ['', Validators.required],
      amount: [0, [Validators.required, Validators.min(0.01)]],
      category: ['Alimentation', Validators.required],
      date: [new Date().toISOString().split('T')[0], Validators.required]
    });
  }

  onSubmit() {
    if (this.expenseForm.valid) {
      const formValue = this.expenseForm.value;
      this.expenseService.addExpense({
        description: formValue.description,
        amount: Number(formValue.amount),
        category: formValue.category,
        date: new Date(formValue.date)
      });
      this.expenseForm.reset({
        description: '',
        amount: 0,
        category: 'Alimentation',
        date: new Date().toISOString().split('T')[0]
      });
    }
  }
}
