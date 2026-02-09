import { Injectable, signal, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { User } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private platformId = inject(PLATFORM_ID);
  private currentUser = signal<User | null>(this.loadUser());
  private users = signal<User[]>(this.loadUsers());

  getCurrentUser() {
    return this.currentUser.asReadonly();
  }

  isAuthenticated(): boolean {
    return this.currentUser() !== null;
  }

  register(nom: string, prenom: string, telephone: string, password: string): { success: boolean; message: string } {
    const existingUser = this.users().find(u => u.telephone === telephone);
    if (existingUser) {
      return { success: false, message: 'Un utilisateur avec ce téléphone existe déjà' };
    }

    const newUser: User = {
      id: crypto.randomUUID(),
      nom,
      prenom,
      telephone,
      password
    };

    this.users.update(users => [...users, newUser]);
    this.saveUsers();
    this.currentUser.set(newUser);
    this.saveUser(newUser);

    return { success: true, message: 'Inscription réussie' };
  }

  login(telephone: string, password: string): { success: boolean; message: string } {
    const user = this.users().find(u => u.telephone === telephone && u.password === password);
    
    if (!user) {
      return { success: false, message: 'Téléphone ou mot de passe incorrect' };
    }

    this.currentUser.set(user);
    this.saveUser(user);
    return { success: true, message: 'Connexion réussie' };
  }

  logout() {
    this.currentUser.set(null);
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem('currentUser');
    }
  }

  private saveUser(user: User) {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem('currentUser', JSON.stringify(user));
    }
  }

  private loadUser(): User | null {
    if (isPlatformBrowser(this.platformId)) {
      const data = localStorage.getItem('currentUser');
      if (data) {
        return JSON.parse(data);
      }
    }
    return null;
  }

  private saveUsers() {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem('users', JSON.stringify(this.users()));
    }
  }

  private loadUsers(): User[] {
    if (isPlatformBrowser(this.platformId)) {
      const data = localStorage.getItem('users');
      if (data) {
        return JSON.parse(data);
      }
    }
    return [];
  }
}
