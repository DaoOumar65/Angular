import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { CategoryService } from '../../services/category.service';
import { ExpenseService } from '../../services/expense.service';
import { BudgetService } from '../../services/budget.service';

@Component({
  selector: 'app-auth',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './auth.component.html',
  styleUrl: './auth.component.scss'
})
export class AuthComponent {
  isLoginMode = true;
  loginForm: FormGroup;
  registerForm: FormGroup;
  errorMessage = '';
  successMessage = '';
  isSubmitting = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private categoryService: CategoryService,
    private expenseService: ExpenseService,
    private budgetService: BudgetService,
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      telephone: ['', [Validators.required, Validators.pattern(/^[0-9]{8}$/)]],
      password: ['', [Validators.required, Validators.minLength(4)]]
    });

    this.registerForm = this.fb.group({
      nom: ['', Validators.required],
      prenom: ['', Validators.required],
      telephone: ['', [Validators.required, Validators.pattern(/^[0-9]{8}$/)]],
      password: ['', [Validators.required, Validators.minLength(4)]]
    });
  }

  toggleMode() {
    this.isLoginMode = !this.isLoginMode;
    this.errorMessage = '';
    this.successMessage = '';
  }

  async onLogin() {
    if (this.loginForm.invalid || this.isSubmitting) {
      return;
    }

    this.isSubmitting = true;
    const { telephone, password } = this.loginForm.value;
    const result = await this.authService.login(telephone, password);

    if (result.success) {
      this.successMessage = result.message;
      this.errorMessage = '';
      await this.hydrateAfterAuth();
      await this.router.navigateByUrl('/dashboard');
    } else {
      this.errorMessage = result.message;
      this.successMessage = '';
    }
    this.isSubmitting = false;
  }

  async onRegister() {
    if (this.registerForm.invalid || this.isSubmitting) {
      return;
    }

    this.isSubmitting = true;
    const { nom, prenom, telephone, password } = this.registerForm.value;
    const result = await this.authService.register(nom, prenom, telephone, password);

    if (result.success) {
      await this.authService.logout();
      this.isLoginMode = true;
      this.registerForm.reset();
      this.loginForm.patchValue({ telephone, password: '' });
      this.successMessage = 'Inscription reussie. Connectez-vous pour acceder au dashboard.';
      this.errorMessage = '';
    } else {
      this.errorMessage = result.message;
      this.successMessage = '';
    }
    this.isSubmitting = false;
  }

  private async hydrateAfterAuth() {
    await Promise.all([
      this.categoryService.loadCategories(),
      this.expenseService.loadExpenses(),
      this.budgetService.loadBudget()
    ]);
  }
}
