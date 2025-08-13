export type TransactionType = 'income' | 'expense';

export interface Transaction {
  id?: string;
  details: string;
  amount: number;
  date: Date;
  isInCome: boolean;
  remark?: string;
  imageUrl?: string;
}
