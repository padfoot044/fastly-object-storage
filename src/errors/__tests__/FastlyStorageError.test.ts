import { FastlyStorageError } from '../FastlyStorageError';

describe('FastlyStorageError', () => {
  it('should create error with message and code', () => {
    const error = new FastlyStorageError('Test error', 'TEST_ERROR');

    expect(error).toBeInstanceOf(Error);
    expect(error).toBeInstanceOf(FastlyStorageError);
    expect(error.message).toBe('Test error');
    expect(error.code).toBe('TEST_ERROR');
    expect(error.name).toBe('FastlyStorageError');
  });

  it('should include status code when provided', () => {
    const error = new FastlyStorageError('Not found', 'NOT_FOUND', {
      statusCode: 404,
    });

    expect(error.statusCode).toBe(404);
  });

  it('should include context when provided', () => {
    const context = { bucket: 'test-bucket', key: 'test-key' };
    const error = new FastlyStorageError('Upload failed', 'UPLOAD_FAILED', {
      context,
    });

    expect(error.context).toEqual(context);
  });

  it('should determine if error is retryable', () => {
    const retryableError = new FastlyStorageError('Server error', 'SERVER_ERROR', {
      statusCode: 500,
    });
    expect(retryableError.isRetryable()).toBe(true);

    const nonRetryableError = new FastlyStorageError('Bad request', 'BAD_REQUEST', {
      statusCode: 400,
    });
    expect(nonRetryableError.isRetryable()).toBe(false);

    const rateLimitError = new FastlyStorageError('Rate limit', 'RATE_LIMIT', {
      statusCode: 429,
    });
    expect(rateLimitError.isRetryable()).toBe(true);
  });

  it('should create error from S3 error', () => {
    const s3Error = new Error('S3 operation failed') as S3Error;
    s3Error.$metadata = {
      httpStatusCode: 404,
      requestId: 'req-123',
    };

    const error = FastlyStorageError.fromS3Error(s3Error, {
      bucket: 'test-bucket',
    });

    expect(error).toBeInstanceOf(FastlyStorageError);
    expect(error.code).toBe('NOT_FOUND');
    expect(error.statusCode).toBe(404);
    expect(error.context?.bucket).toBe('test-bucket');
  });
});

interface S3Error extends Error {
  $metadata?: {
    httpStatusCode?: number;
    requestId?: string;
  };
}
