// src/app/models/category.model.ts

export interface Category {
  id: string;
  name: string;
  color: string;
  icon?: string;
  isDefault: boolean;
}

export const DEFAULT_CATEGORIES: Category[] = [
  { id: '1', name: 'Alimentation', color: '#FF6B6B', icon: '🍔', isDefault: true },
  { id: '2', name: 'Transport', color: '#4ECDC4', icon: '🚗', isDefault: true },
  { id: '3', name: 'Loisirs', color: '#45B7D1', icon: '🎮', isDefault: true },
  { id: '4', name: 'Santé', color: '#96CEB4', icon: '⚕️', isDefault: true },
  { id: '5', name: 'Shopping', color: '#FFEAA7', icon: '🛍️', isDefault: true },
  { id: '6', name: 'Logement', color: '#DFE6E9', icon: '🏠', isDefault: true },
  { id: '7', name: 'Éducation', color: '#A29BFE', icon: '📚', isDefault: true },
  { id: '8', name: 'Autres', color: '#FD79A8', icon: '📌', isDefault: true }
];