import { Readable } from 'stream';

/**
 * Main configuration for Fastly Storage Client
 */
export interface FastlyStorageConfig {
  /** S3-compatible endpoint URL */
  endpoint?: string;
  /** Access key ID */
  accessKeyId?: string;
  /** Secret access key */
  secretAccessKey?: string;
  /** AWS region */
  region?: string;
  /** Maximum number of retry attempts */
  maxRetries?: number;
  /** Request timeout in milliseconds */
  timeout?: number;
  /** Custom logger implementation */
  logger?: Logger;
  /** Retry policy configuration */
  retryPolicy?: RetryPolicy;
  /** Force path style URLs */
  forcePathStyle?: boolean;
}

/**
 * Bucket creation configuration
 */
export interface BucketConfig {
  /** Access control list */
  acl?: 'private' | 'public-read' | 'public-read-write' | 'authenticated-read';
  /** Region for bucket creation */
  region?: string;
}

/**
 * Options for uploading objects
 */
export interface UploadObjectOptions {
  /** Content type of the object */
  contentType?: string;
  /** Custom metadata */
  metadata?: Record<string, string>;
  /** Cache control header */
  cacheControl?: string;
  /** Content disposition header */
  contentDisposition?: string;
  /** Content encoding header */
  contentEncoding?: string;
  /** Access control list */
  acl?: 'private' | 'public-read' | 'public-read-write' | 'authenticated-read';
  /** Progress callback */
  onProgress?: ProgressCallback;
  /** Abort signal for cancellation */
  abortSignal?: AbortSignal;
  /** Server-side encryption */
  serverSideEncryption?: 'AES256' | 'aws:kms';
  /** Storage class */
  storageClass?: 'STANDARD' | 'REDUCED_REDUNDANCY' | 'GLACIER' | 'STANDARD_IA';
}

/**
 * Options for getting objects
 */
export interface GetObjectOptions {
  /** Byte range to download */
  range?: string;
  /** Return object only if modified since date */
  ifModifiedSince?: Date;
  /** Return object only if unmodified since date */
  ifUnmodifiedSince?: Date;
  /** Return object only if ETag matches */
  ifMatch?: string;
  /** Return object only if ETag doesn't match */
  ifNoneMatch?: string;
  /** Abort signal for cancellation */
  abortSignal?: AbortSignal;
}

/**
 * Options for listing objects
 */
export interface ListObjectsOptions {
  /** Limits results to keys that begin with the specified prefix */
  prefix?: string;
  /** Character used to group keys */
  delimiter?: string;
  /** Maximum number of keys to return */
  maxKeys?: number;
  /** Continuation token for pagination */
  continuationToken?: string;
  /** Start listing after this key */
  startAfter?: string;
}

/**
 * Result from listing objects
 */
export interface ListObjectsResult {
  /** List of objects */
  contents: ObjectInfo[];
  /** Common prefixes (folders) */
  commonPrefixes: string[];
  /** Whether the result is truncated */
  isTruncated: boolean;
  /** Token for next page */
  nextContinuationToken?: string;
  /** Bucket name */
  name: string;
  /** Prefix used for listing */
  prefix?: string;
  /** Max keys requested */
  maxKeys: number;
  /** Key count in this response */
  keyCount: number;
}

/**
 * Object information
 */
export interface ObjectInfo {
  /** Object key */
  key: string;
  /** Last modified date */
  lastModified: Date;
  /** ETag */
  etag: string;
  /** Size in bytes */
  size: number;
  /** Storage class */
  storageClass: string;
  /** Owner information */
  owner?: {
    id: string;
    displayName: string;
  };
}

/**
 * Object metadata
 */
export interface ObjectMetadata {
  /** Content type */
  contentType?: string;
  /** Content length */
  contentLength: number;
  /** Last modified date */
  lastModified: Date;
  /** ETag */
  etag: string;
  /** Custom metadata */
  metadata: Record<string, string>;
  /** Cache control */
  cacheControl?: string;
  /** Content disposition */
  contentDisposition?: string;
  /** Content encoding */
  contentEncoding?: string;
  /** Version ID */
  versionId?: string;
  /** Storage class */
  storageClass?: string;
}

/**
 * Result from uploading an object
 */
export interface UploadResult {
  /** ETag of uploaded object */
  etag?: string;
  /** Version ID if versioning is enabled */
  versionId?: string;
  /** Server-side encryption */
  serverSideEncryption?: string;
  /** Location URL */
  location?: string;
}

/**
 * Options for copying objects
 */
export interface CopyObjectOptions {
  /** Metadata directive */
  metadataDirective?: 'COPY' | 'REPLACE';
  /** New metadata (if REPLACE) */
  metadata?: Record<string, string>;
  /** New content type */
  contentType?: string;
  /** New ACL */
  acl?: 'private' | 'public-read' | 'public-read-write' | 'authenticated-read';
  /** Copy only if modified since */
  copySourceIfModifiedSince?: Date;
  /** Copy only if unmodified since */
  copySourceIfUnmodifiedSince?: Date;
}

/**
 * Multipart upload result
 */
export interface MultipartUploadResult {
  /** Upload ID */
  uploadId: string;
  /** Bucket name */
  bucket: string;
  /** Object key */
  key: string;
}

/**
 * Multipart upload part
 */
export interface UploadPart {
  /** Part number (1-10000) */
  partNumber: number;
  /** ETag of the part */
  etag: string;
}

/**
 * Result from uploading a part
 */
export interface UploadPartResult {
  /** ETag of uploaded part */
  etag: string;
  /** Part number */
  partNumber: number;
}

/**
 * Options for presigned URLs
 */
export interface PresignedUrlOptions {
  /** Expiration time in seconds */
  expiresIn: number;
  /** Custom request parameters */
  params?: Record<string, string>;
}

/**
 * Bucket information
 */
export interface BucketInfo {
  /** Bucket name */
  name: string;
  /** Creation date */
  creationDate: Date;
  /** Region */
  region?: string;
}

/**
 * Logger interface
 */
export interface Logger {
  debug(message: string, meta?: unknown): void;
  info(message: string, meta?: unknown): void;
  warn(message: string, meta?: unknown): void;
  error(message: string, meta?: unknown): void;
}

/**
 * Retry policy configuration
 */
export interface RetryPolicy {
  /** Maximum number of retries */
  maxRetries: number;
  /** Initial delay in milliseconds */
  retryDelay: number;
  /** Delay multiplier for exponential backoff */
  retryDelayMultiplier: number;
  /** Maximum delay in milliseconds */
  maxRetryDelay?: number;
  /** Function to determine if error is retryable */
  isRetryable?: (error: Error) => boolean;
}

/**
 * Progress callback function
 */
export type ProgressCallback = (progress: {
  loaded: number;
  total: number;
  percentage: number;
}) => void;

/**
 * Supported data types for upload
 */
export type UploadData = Buffer | Readable | Blob | string;

/**
 * Download result
 */
export interface DownloadResult {
  /** Object body */
  body: Buffer;
  /** Content type */
  contentType?: string;
  /** Content length */
  contentLength: number;
  /** ETag */
  etag: string;
  /** Last modified */
  lastModified: Date;
  /** Metadata */
  metadata: Record<string, string>;
}
