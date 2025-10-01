/**
 * Fastly Object Storage SDK
 * A modern TypeScript SDK for Fastly's S3-compatible Object Storage
 */

export { FastlyStorageClient } from './client';
export { FastlyStorageError } from './errors/FastlyStorageError';

// Types
export type {
  FastlyStorageConfig,
  BucketConfig,
  UploadObjectOptions,
  GetObjectOptions,
  ListObjectsOptions,
  ListObjectsResult,
  ObjectMetadata,
  UploadResult,
  MultipartUploadResult,
  PresignedUrlOptions,
  CopyObjectOptions,
  Logger,
  RetryPolicy,
  ProgressCallback,
} from './types';
