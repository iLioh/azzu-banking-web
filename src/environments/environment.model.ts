export interface AppEnvironment {
  production: boolean;
  useMockBackend: boolean;
  authStrategy: 'mock-credentials' | 'bff-oidc';
  apiBaseUrl: string;
  defaultIdleTimeoutSeconds: number;
  idleWarningSeconds: number;
}
