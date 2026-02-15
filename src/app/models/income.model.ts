export interface Income {
  id: string;
  description: string;
  amount: number;
  source: string;
  date: Date;
  isRecurring: boolean;
}
