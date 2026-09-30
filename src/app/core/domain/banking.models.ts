export interface Account {
  id: string;
  name: string;
  type: string;
  lastDigits: string;
  balance: number;
  available: number;
  accent: 'violet' | 'blue';
  currency?: 'PEN' | 'USD';
}

export interface Transaction {
  id: string;
  accountId: string;
  counterparty: string;
  detail: string;
  date: string;
  amount: number;
  category: 'income' | 'expense';
  initials: string;
  color: 'coral' | 'purple' | 'green';
}

export interface BankNotification {
  id: string;
  type: 'transfer' | 'card' | 'security';
  title: string;
  detail: string;
  date: string;
  route: string;
  unread: boolean;
}
