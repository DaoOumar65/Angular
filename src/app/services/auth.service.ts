import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { User } from '../models/user.model';
import { StorageService } from './storage.service';
import { API_BASE_URL } from '../config/api.config';

interface AuthResult {
  success: boolean;
  message: string;
}

interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
}

interface AuthPayload {
  user: User;
  token: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly storageService = inject(StorageService);
  private readonly currentUserKey = 'currentUser';
  private readonly tokenKey = 'auth_token';

  private currentUser = signal<User | null>(this.loadUser());

  constructor() {
    if (this.hasToken() && !this.currentUser()) {
      this.refreshCurrentUser();
    }
  }

  getCurrentUser() {
    return this.currentUser.asReadonly();
  }

  getCurrentUserValue(): User | null {
    return this.currentUser();
  }

  isAuthenticated(): boolean {
    return !!this.currentUser() && this.hasToken();
  }

  hasToken(): boolean {
    return !!this.storageService.getItem(this.tokenKey);
  }

  async register(nom: string, prenom: string, telephone: string, password: string): Promise<AuthResult> {
    try {
      const response = await firstValueFrom(
        this.http.post<ApiResponse<AuthPayload>>(`${API_BASE_URL}/auth/register`, {
          nom: nom.trim(),
          prenom: prenom.trim(),
          telephone: telephone.trim(),
          password
        })
      );

      this.setSession(response.data.user, response.data.token);
      return { success: true, message: response.message || 'Inscription reussie' };
    } catch (error: any) {
      return { success: false, message: this.extractErrorMessage(error, 'Echec inscription') };
    }
  }

  async login(telephone: string, password: string): Promise<AuthResult> {
    try {
      const response = await firstValueFrom(
        this.http.post<ApiResponse<AuthPayload>>(`${API_BASE_URL}/auth/login`, {
          telephone: telephone.trim(),
          password
        })
      );

      this.setSession(response.data.user, response.data.token);
      return { success: true, message: response.message || 'Connexion reussie' };
    } catch (error: any) {
      return { success: false, message: this.extractErrorMessage(error, 'Telephone ou mot de passe incorrect') };
    }
  }

  async refreshCurrentUser(): Promise<void> {
    if (!this.hasToken()) {
      return;
    }

    try {
      const response = await firstValueFrom(
        this.http.get<ApiResponse<User>>(`${API_BASE_URL}/auth/me`)
      );

      this.currentUser.set(response.data);
      this.storageService.setJson(this.currentUserKey, response.data);
    } catch {
      this.clearSession();
    }
  }

  async logout(): Promise<void> {
    try {
      await firstValueFrom(this.http.post(`${API_BASE_URL}/auth/logout`, {}));
    } catch {
      // Ignore API logout failure and clear local session anyway.
    }

    this.clearSession();
  }

  private setSession(user: User, token: string) {
    this.currentUser.set(user);
    this.storageService.setJson(this.currentUserKey, user);
    this.storageService.setItem(this.tokenKey, token);
  }

  private clearSession() {
    this.currentUser.set(null);
    this.storageService.removeItem(this.currentUserKey);
    this.storageService.removeItem(this.tokenKey);
    this.storageService.removeItem('categories_cache');
    this.storageService.removeItem('budget_cache');
  }

  private loadUser(): User | null {
    return this.storageService.getJson<User | null>(this.currentUserKey, null);
  }

  private extractErrorMessage(error: any, fallback: string): string {
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

    return fallback;
  }
}
