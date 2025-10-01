import type { FastlyStorageConfig } from '../types';
import { FastlyStorageError } from '../errors/FastlyStorageError';

/**
 * Validates configuration
 */
export function validateConfig(config: Required<FastlyStorageConfig>): void {
  if (!config.endpoint) {
    throw new FastlyStorageError(
      'Endpoint is required. Set FASTLY_ENDPOINT environment variable or provide in config.',
      'INVALID_CONFIG',
      { context: { field: 'endpoint' } }
    );
  }

  if (!config.accessKeyId) {
    throw new FastlyStorageError(
      'Access Key ID is required. Set FASTLY_ACCESS_KEY_ID environment variable or provide in config.',
      'INVALID_CONFIG',
      { context: { field: 'accessKeyId' } }
    );
  }

  if (!config.secretAccessKey) {
    throw new FastlyStorageError(
      'Secret Access Key is required. Set FASTLY_SECRET_ACCESS_KEY environment variable or provide in config.',
      'INVALID_CONFIG',
      { context: { field: 'secretAccessKey' } }
    );
  }

  if (!isValidUrl(config.endpoint)) {
    throw new FastlyStorageError('Invalid endpoint URL', 'INVALID_CONFIG', {
      context: { field: 'endpoint', value: config.endpoint },
    });
  }

  if (config.maxRetries < 0) {
    throw new FastlyStorageError('maxRetries must be non-negative', 'INVALID_CONFIG', {
      context: { field: 'maxRetries', value: config.maxRetries },
    });
  }

  if (config.timeout <= 0) {
    throw new FastlyStorageError('timeout must be positive', 'INVALID_CONFIG', {
      context: { field: 'timeout', value: config.timeout },
    });
  }
}

/**
 * Validates a bucket name
 */
export function validateBucketName(name: string): void {
  if (!name) {
    throw new FastlyStorageError('Bucket name is required', 'INVALID_BUCKET_NAME');
  }

  if (name.length < 3 || name.length > 63) {
    throw new FastlyStorageError(
      'Bucket name must be between 3 and 63 characters',
      'INVALID_BUCKET_NAME',
      {
        context: { name },
      }
    );
  }

  if (!/^[a-z0-9][a-z0-9.-]*[a-z0-9]$/.test(name)) {
    throw new FastlyStorageError(
      'Bucket name must start and end with a letter or number, and contain only lowercase letters, numbers, dots, and hyphens',
      'INVALID_BUCKET_NAME',
      { context: { name } }
    );
  }

  if (/\.\./.test(name)) {
    throw new FastlyStorageError(
      'Bucket name cannot contain consecutive dots',
      'INVALID_BUCKET_NAME',
      {
        context: { name },
      }
    );
  }
}

/**
 * Validates an object key
 */
export function validateObjectKey(key: string): void {
  if (!key) {
    throw new FastlyStorageError('Object key is required', 'INVALID_OBJECT_KEY');
  }

  if (key.length > 1024) {
    throw new FastlyStorageError(
      'Object key must not exceed 1024 characters',
      'INVALID_OBJECT_KEY',
      {
        context: { key, length: key.length },
      }
    );
  }
}

/**
 * Checks if a string is a valid URL
 */
function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}
