export type TransactionType = 'income' | 'expense';

export interface Transaction {
  id?: string;
  description: string;
  amount: number;
  date: Date;
  type: TransactionType;
  imageUrl?: string;
}
