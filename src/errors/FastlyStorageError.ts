/**
 * Custom error class for Fastly Storage operations
 */
/**
 * Custom error class for Fastly Storage operations
 */
export class FastlyStorageError extends Error {
  public readonly code: string;
  public readonly statusCode?: number;
  public readonly context?: Record<string, unknown>;
  public readonly cause?: unknown;

  constructor(
    message: string,
    code: string,
    options?: {
      statusCode?: number;
      context?: Record<string, unknown>;
      cause?: unknown;
    }
  ) {
    super(message);
    this.name = 'FastlyStorageError';
    this.code = code;
    this.statusCode = options?.statusCode;
    this.context = options?.context;

    if (options?.cause) {
      this.cause = options.cause;
    }

    // Maintains proper stack trace for where error was thrown
    const errorWithCapture = Error as ErrorWithCaptureStackTrace;
    if (typeof errorWithCapture.captureStackTrace === 'function') {
      errorWithCapture.captureStackTrace(this, FastlyStorageError);
    }
  }

  /**
   * Creates error from S3 SDK error
   */
  static fromS3Error(error: Error, context?: Record<string, unknown>): FastlyStorageError {
    const s3Error = error as S3ServiceError;

    return new FastlyStorageError(
      s3Error.message || 'S3 operation failed',
      s3Error.$metadata?.httpStatusCode === 404 ? 'NOT_FOUND' : s3Error.name || 'UNKNOWN_ERROR',
      {
        statusCode: s3Error.$metadata?.httpStatusCode,
        context: {
          ...context,
          requestId: s3Error.$metadata?.requestId,
        },
        cause: error,
      }
    );
  }

  /**
   * Check if error is retryable
   */
  isRetryable(): boolean {
    if (!this.statusCode) return false;

    // Retry on 5xx errors and specific 4xx errors
    if (this.statusCode >= 500) return true;
    if (this.statusCode === 429) return true; // Too Many Requests
    if (this.statusCode === 408) return true; // Request Timeout

    // Retry on network errors
    if (this.code === 'ECONNRESET' || this.code === 'ETIMEDOUT') return true;

    return false;
  }
}

/**
 * S3 service error interface
 */
interface S3ServiceError extends Error {
  $metadata?: {
    httpStatusCode?: number;
    requestId?: string;
  };
}

/**
 * Error constructor with captureStackTrace
 */
interface ErrorWithCaptureStackTrace extends ErrorConstructor {
  // eslint-disable-next-line @typescript-eslint/ban-types
  captureStackTrace(targetObject: object, constructorOpt?: Function): void;
}
