import { InjectionToken } from '@angular/core';
import { Observable } from 'rxjs';
import { Account, BankNotification, Transaction } from '../../domain/banking.models';

export interface BankingQueryPort {
  getCustomerName(): Observable<string>;
  getAccounts(): Observable<readonly Account[]>;
  getRecentTransactions(): Observable<readonly Transaction[]>;
  getNotifications(): Observable<readonly BankNotification[]>;
}

export const BANKING_QUERY_PORT = new InjectionToken<BankingQueryPort>('BANKING_QUERY_PORT');
