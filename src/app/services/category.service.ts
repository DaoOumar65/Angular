import { Injectable, computed, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { ExpenseCategory } from '../models/expense.model';
import { API_BASE_URL } from '../config/api.config';
import { StorageService } from './storage.service';

interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
}

interface ApiCategory {
  id: number;
  name: string;
  is_default: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class CategoryService {
  private readonly http = inject(HttpClient);
  private readonly storageService = inject(StorageService);
  private readonly storageKey = 'categories_cache';

  private categories = signal<ApiCategory[]>(this.storageService.getJson<ApiCategory[]>(this.storageKey, []));
  private categoryNames = computed<ExpenseCategory[]>(() => this.categories().map((c) => c.name));

  getCategories() {
    return this.categoryNames;
  }

  getCategoryIdByName(name: string): number | null {
    const category = this.categories().find((item) => item.name === name.trim());
    return category ? category.id : null;
  }

  async loadCategories(): Promise<void> {
    try {
      const response = await firstValueFrom(
        this.http.get<ApiResponse<ApiCategory[]>>(`${API_BASE_URL}/categories`)
      );
      this.categories.set(response.data || []);
      this.storageService.setJson(this.storageKey, this.categories());
    } catch {
      // Keep cached categories on transient backend errors.
    }
  }

  async addCategory(category: ExpenseCategory): Promise<boolean> {
    const normalized = category.trim();
    if (!normalized || this.getCategoryIdByName(normalized)) {
      return false;
    }

    try {
      const response = await firstValueFrom(
        this.http.post<ApiResponse<ApiCategory>>(`${API_BASE_URL}/categories`, { name: normalized })
      );

      this.categories.update((items) => [...items, response.data]);
      this.storageService.setJson(this.storageKey, this.categories());
      return true;
    } catch {
      return false;
    }
  }

  async updateCategory(oldCategory: ExpenseCategory, newCategory: ExpenseCategory): Promise<boolean> {
    const oldName = oldCategory.trim();
    const newName = newCategory.trim();
    if (!oldName || !newName || oldName === newName) {
      return false;
    }

    const categoryId = this.getCategoryIdByName(oldName);
    if (!categoryId) {
      return false;
    }

    try {
      const response = await firstValueFrom(
        this.http.put<ApiResponse<ApiCategory>>(`${API_BASE_URL}/categories/${categoryId}`, { name: newName })
      );

      this.categories.update((items) =>
        items.map((item) => (item.id === categoryId ? response.data : item))
      );
      this.storageService.setJson(this.storageKey, this.categories());
      return true;
    } catch {
      return false;
    }
  }

  async deleteCategory(category: ExpenseCategory): Promise<{ success: boolean; conflict: boolean }> {
    const categoryId = this.getCategoryIdByName(category);
    if (!categoryId) {
      return { success: false, conflict: false };
    }

    try {
      await firstValueFrom(this.http.delete(`${API_BASE_URL}/categories/${categoryId}`));
      this.categories.update((items) => items.filter((item) => item.id !== categoryId));
      this.storageService.setJson(this.storageKey, this.categories());
      return { success: true, conflict: false };
    } catch (error: any) {
      if (error?.status === 409) {
        return { success: false, conflict: true };
      }
      return { success: false, conflict: false };
    }
  }

  isDefaultCategory(category: ExpenseCategory): boolean {
    return !!this.categories().find((item) => item.name === category && item.is_default);
  }

  getCategoryIcon(category: string): string {
    const icons: { [key: string]: string } = {
      Alimentation: 'fas fa-utensils',
      Transport: 'fas fa-car',
      Loisirs: 'fas fa-gamepad',
      Sante: 'fas fa-heartbeat',
      Logement: 'fas fa-home',
      Autre: 'fas fa-ellipsis-h'
    };
    return icons[category] || 'fas fa-tag';
  }

  clearCache() {
    this.categories.set([]);
    this.storageService.removeItem(this.storageKey);
  }
}
