import { Injectable } from '@angular/core';
import { of } from 'rxjs';
import { Account, BankNotification, Transaction } from '../../domain/banking.models';
import { BankingQueryPort } from '../../application/ports/banking-query.port';

@Injectable()
export class MockBankingQueryAdapter implements BankingQueryPort {
  private readonly customerName = 'Mariana';

  private readonly accounts: readonly Account[] = [
    { id: 'checking-1', name: 'Cuenta Sueldo', type: 'Cuenta sueldo', lastDigits: '•••• 4821', balance: 12840.5, available: 12840.5, accent: 'violet', currency: 'PEN' },
    { id: 'savings-1', name: 'Cuenta Ahorros', type: 'Cuenta ahorros', lastDigits: '•••• 1763', balance: 8320.15, available: 8320.15, accent: 'blue', currency: 'PEN' },
    { id: 'card-1', name: 'Tarjeta Azzu Visa', type: 'Tarjeta', lastDigits: '•••• 2048', balance: 3250, available: 3250, accent: 'violet', currency: 'PEN' },
  ];

  private readonly recentTransactions: readonly Transaction[] = [
    { id: 'tx-1', accountId: 'checking-1', counterparty: 'Mercado Norte', detail: 'Compras', date: 'Hoy, 09:18', amount: -86.9, category: 'expense', initials: 'MN', color: 'coral' },
    { id: 'tx-2', accountId: 'checking-1', counterparty: 'Transferencia recibida', detail: 'Carlos Rojas', date: 'Ayer, 14:22', amount: 600, category: 'income', initials: 'TR', color: 'green' },
    { id: 'tx-3', accountId: 'savings-1', counterparty: 'La Trattoria', detail: 'Restaurantes', date: '12 abr.', amount: -125.4, category: 'expense', initials: 'LT', color: 'purple' },
    { id: 'tx-4', accountId: 'checking-1', counterparty: 'Pago de luz', detail: 'Servicios', date: '10 abr.', amount: -97.5, category: 'expense', initials: 'PL', color: 'purple' },
    { id: 'tx-5', accountId: 'savings-1', counterparty: 'Falabella', detail: 'Compras', date: '08 abr.', amount: -210, category: 'expense', initials: 'FA', color: 'green' },
  ];

  private readonly notifications: readonly BankNotification[] = [
    { id: 'notification-1', type: 'transfer', title: 'Transferencia recibida', detail: 'Recibiste S/ 600.00 de Carlos Rojas.', date: 'Hace 18 min', route: 'operaciones/movimientos', unread: true },
    { id: 'notification-2', type: 'card', title: 'Compra con tu tarjeta', detail: 'Consumo de S/ 86.90 en Mercado Norte.', date: 'Hoy, 09:18', route: 'productos/tarjetas', unread: true },
    { id: 'notification-3', type: 'security', title: 'Inicio de sesión correcto', detail: 'Acceso reconocido desde este dispositivo.', date: 'Hoy, 08:54', route: 'configuracion/seguridad', unread: true },
  ];

  getCustomerName() { return of(this.customerName); }
  getAccounts() { return of(this.accounts); }
  getRecentTransactions() { return of(this.recentTransactions); }
  getNotifications() { return of(this.notifications); }
}
