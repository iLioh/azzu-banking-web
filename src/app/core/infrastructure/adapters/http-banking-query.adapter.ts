import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { BankingQueryPort } from '../../application/ports/banking-query.port';
import { Account, BankNotification, Transaction } from '../../domain/banking.models';

@Injectable()
export class HttpBankingQueryAdapter implements BankingQueryPort {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = environment.apiBaseUrl;

  getCustomerName(): Observable<string> {
    return this.http.get<string>(`${this.baseUrl}/customers/me/display-name`, { withCredentials: true });
  }

  getAccounts(): Observable<readonly Account[]> {
    return this.http.get<readonly Account[]>(`${this.baseUrl}/accounts`, { withCredentials: true });
  }

  getRecentTransactions(): Observable<readonly Transaction[]> {
    return this.http.get<readonly Transaction[]>(`${this.baseUrl}/transactions`, { withCredentials: true });
  }

  getNotifications(): Observable<readonly BankNotification[]> {
    return this.http.get<readonly BankNotification[]>(`${this.baseUrl}/notifications`, { withCredentials: true });
  }
}
