import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth.service';

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

  constructor(
    private fb: FormBuilder,
    private authService: AuthService
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

  onLogin() {
    if (this.loginForm.valid) {
      const { telephone, password } = this.loginForm.value;
      const result = this.authService.login(telephone, password);
      
      if (result.success) {
        this.successMessage = result.message;
        this.errorMessage = '';
      } else {
        this.errorMessage = result.message;
        this.successMessage = '';
      }
    }
  }

  onRegister() {
    if (this.registerForm.valid) {
      const { nom, prenom, telephone, password } = this.registerForm.value;
      const result = this.authService.register(nom, prenom, telephone, password);
      
      if (result.success) {
        this.successMessage = result.message;
        this.errorMessage = '';
      } else {
        this.errorMessage = result.message;
        this.successMessage = '';
      }
    }
  }
}
