export type RecurringFrequency = 'daily' | 'weekly' | 'monthly' | 'yearly';

export interface RecurringExpense {
  id: string;
  description: string;
  amount: number;
  category: string;
  frequency: RecurringFrequency;
  startDate: Date;
  endDate?: Date;
  isActive: boolean;
  lastGenerated?: Date;
  nextDue?: Date;
}
