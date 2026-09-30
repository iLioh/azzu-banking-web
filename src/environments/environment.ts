import { AppEnvironment } from './environment.model';

export const environment: AppEnvironment = {
  production: false,
  useMockBackend: true,
  authStrategy: 'mock-credentials',
  apiBaseUrl: '/api/v1',
  defaultIdleTimeoutSeconds: 15 * 60,
  idleWarningSeconds: 2 * 60,
};
