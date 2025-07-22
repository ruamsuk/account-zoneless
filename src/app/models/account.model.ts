export interface Account {
  id?: string;
  date?: Date;
  details: string;
  amount: number;
  create?: Date;
  modify?: Date;
  isInCome: boolean;
  remark?: string;
}

export interface MonthlySummary {
  month: number;
  monthName?: string;
  income: number;
  expense: number;
  minIncome: number;
  maxIncome: number;
  avgIncome: number;
  minExpense: number;
  maxExpense: number;
  avgExpense: number;
  incomeCount: number;
  expenseCount: number;
}

export interface YearSummary {
  [month: string]: {
    income: number;
    expense: number;
    balance: number; // <---
  };
}

export interface MonthlyData {
  id: string; // หรือชนิดข้อมูลอื่นที่เหมาะสมกับ id ของเอกสารใน collection ของคุณ
  month: string;
  datestart: Date;
  dateend: Date;
  year: number;
}

export interface AccountData {
  id: string; // หรือชนิดข้อมูลอื่นที่เหมาะสมกับ id ของเอกสารใน collection ของคุณ
  amount: number;
  date: Date;
  details: string;
  isInCome: boolean;
  remark: string;
}
