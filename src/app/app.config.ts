import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideHttpClient, withInterceptors, withXsrfConfiguration } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { environment } from '../environments/environment';
import { AUTH_PORT } from './core/application/ports/auth.port';
import { BANKING_QUERY_PORT } from './core/application/ports/banking-query.port';
import { BANKING_COMMAND_PORT } from './core/application/ports/banking-command.port';
import { HttpAuthAdapter } from './core/infrastructure/adapters/http-auth.adapter';
import { HttpBankingCommandAdapter } from './core/infrastructure/adapters/http-banking-command.adapter';
import { HttpBankingQueryAdapter } from './core/infrastructure/adapters/http-banking-query.adapter';
import { MockAuthAdapter } from './core/infrastructure/adapters/mock-auth.adapter';
import { MockBankingQueryAdapter } from './core/infrastructure/adapters/mock-banking-query.adapter';
import { MockBankingCommandAdapter } from './core/infrastructure/adapters/mock-banking-command.adapter';
import { routes } from './app.routes';
import { bankingHttpInterceptor } from './core/http/banking-http.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideHttpClient(
      withXsrfConfiguration({ cookieName: 'XSRF-TOKEN', headerName: 'X-XSRF-TOKEN' }),
      withInterceptors([bankingHttpInterceptor]),
    ),
    { provide: AUTH_PORT, useClass: environment.useMockBackend ? MockAuthAdapter : HttpAuthAdapter },
    { provide: BANKING_QUERY_PORT, useClass: environment.useMockBackend ? MockBankingQueryAdapter : HttpBankingQueryAdapter },
    { provide: BANKING_COMMAND_PORT, useClass: environment.useMockBackend ? MockBankingCommandAdapter : HttpBankingCommandAdapter },
  ]
};
