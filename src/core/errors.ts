export type ErrorCode =
  | 'TOKEN_INVALID'
  | 'TOKEN_EXPIRED'
  | 'APP_KEY_INVALID'
  | 'INPUT_TOO_LONG'
  | 'RATE_LIMITED'
  | 'DAILY_CAP_REACHED'
  | 'PROVIDER_TIMEOUT'
  | 'INTERNAL_ERROR'
  | 'BAD_REQUEST';

export class ApiError extends Error {
  public readonly statusCode: number;
  public readonly errorCode: ErrorCode;
  public readonly meta?: Record<string, unknown>;

  constructor(statusCode: number, errorCode: ErrorCode, message: string, meta?: Record<string, unknown>) {
    super(message);
    this.statusCode = statusCode;
    this.errorCode = errorCode;
    this.meta = meta;
  }
}

export const isAbortError = (error: unknown): boolean => {
  return error instanceof Error && (error.name === 'AbortError' || /aborted|abort/i.test(error.message));
};
