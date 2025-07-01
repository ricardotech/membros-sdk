export class MembrosError extends Error {
  public readonly code: string;
  public readonly statusCode: number;
  public readonly details?: any;

  constructor(
    message: string,
    code: string = 'UNKNOWN_ERROR',
    statusCode: number = 500,
    details?: any
  ) {
    super(message);
    this.name = 'MembrosError';
    this.code = code;
    this.statusCode = statusCode;
    this.details = details;

    // Maintains proper stack trace for where our error was thrown
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, MembrosError);
    }
  }
}

export class MembrosAPIError extends MembrosError {
  constructor(
    message: string,
    code: string = 'API_ERROR',
    statusCode: number = 500,
    details?: any
  ) {
    super(message, code, statusCode, details);
    this.name = 'MembrosAPIError';
  }
}

export class MembrosAuthenticationError extends MembrosError {
  constructor(
    message: string = 'Authentication failed',
    code: string = 'AUTHENTICATION_ERROR',
    statusCode: number = 401,
    details?: any
  ) {
    super(message, code, statusCode, details);
    this.name = 'MembrosAuthenticationError';
  }
}

export class MembrosValidationError extends MembrosError {
  constructor(
    message: string,
    code: string = 'VALIDATION_ERROR',
    statusCode: number = 400,
    details?: any
  ) {
    super(message, code, statusCode, details);
    this.name = 'MembrosValidationError';
  }
}

export class MembrosNetworkError extends MembrosError {
  constructor(
    message: string = 'Network request failed',
    code: string = 'NETWORK_ERROR',
    statusCode: number = 0,
    details?: any
  ) {
    super(message, code, statusCode, details);
    this.name = 'MembrosNetworkError';
  }
}

export class MembrosRateLimitError extends MembrosError {
  constructor(
    message: string = 'Rate limit exceeded',
    code: string = 'RATE_LIMIT_ERROR',
    statusCode: number = 429,
    details?: any
  ) {
    super(message, code, statusCode, details);
    this.name = 'MembrosRateLimitError';
  }
}

export class MembrosNotFoundError extends MembrosError {
  constructor(
    message: string = 'Resource not found',
    code: string = 'NOT_FOUND_ERROR',
    statusCode: number = 404,
    details?: any
  ) {
    super(message, code, statusCode, details);
    this.name = 'MembrosNotFoundError';
  }
}

export class MembrosPermissionError extends MembrosError {
  constructor(
    message: string = 'Permission denied',
    code: string = 'PERMISSION_ERROR',
    statusCode: number = 403,
    details?: any
  ) {
    super(message, code, statusCode, details);
    this.name = 'MembrosPermissionError';
  }
}

export function createMembrosError(
  statusCode: number,
  message: string,
  code?: string,
  details?: any
): MembrosError {
  switch (statusCode) {
    case 400:
      return new MembrosValidationError(message, code, statusCode, details);
    case 401:
      return new MembrosAuthenticationError(message, code, statusCode, details);
    case 403:
      return new MembrosPermissionError(message, code, statusCode, details);
    case 404:
      return new MembrosNotFoundError(message, code, statusCode, details);
    case 429:
      return new MembrosRateLimitError(message, code, statusCode, details);
    default:
      if (statusCode >= 500) {
        return new MembrosAPIError(message, code, statusCode, details);
      }
      return new MembrosError(message, code, statusCode, details);
  }
}