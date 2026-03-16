export const servicePausedRoute = '/service-paused';

type ServicePauseKind = 'timeout' | 'network' | 'server' | 'invalid_response';

interface ServicePausedCandidateErrorOptions {
  kind: ServicePauseKind;
  path: string;
  status?: number;
}

export class ServicePausedCandidateError extends Error {
  readonly kind: ServicePauseKind;
  readonly path: string;
  readonly status?: number;

  constructor(message: string, options: ServicePausedCandidateErrorOptions) {
    super(message);
    this.name = 'ServicePausedCandidateError';
    this.kind = options.kind;
    this.path = options.path;
    this.status = options.status;
  }
}

export const isServicePausedCandidateError = (
  error: unknown
): error is ServicePausedCandidateError => error instanceof ServicePausedCandidateError;

export const buildServicePausedPath = (from?: string) => {
  const params = new URLSearchParams();
  if (from) params.set('from', from);
  const query = params.toString();
  return query ? `${servicePausedRoute}?${query}` : servicePausedRoute;
};

export const getNextRecoveryDate = (baseDate = new Date()) =>
  new Date(baseDate.getFullYear(), baseDate.getMonth() + 1, 1);
