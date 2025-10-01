import { S3Client, S3ClientConfig } from '@aws-sdk/client-s3';
import type {
  FastlyStorageConfig,
  BucketConfig,
  UploadObjectOptions,
  GetObjectOptions,
  ListObjectsOptions,
  ListObjectsResult,
  ObjectMetadata,
  UploadResult,
  MultipartUploadResult,
  UploadPart,
  UploadPartResult,
  BucketInfo,
  CopyObjectOptions,
  UploadData,
  DownloadResult,
  Logger,
} from './types';
import { BucketOperations } from './operations/BucketOperations';
import { ObjectOperations } from './operations/ObjectOperations';
import { MultipartOperations } from './operations/MultipartOperations';
import { PresignedUrlOperations } from './operations/PresignedUrlOperations';
import { DefaultLogger } from './utils/logger';
import { validateConfig } from './utils/validation';
import { Readable } from 'stream';

/**
 * Main client for Fastly Object Storage operations
 */
export class FastlyStorageClient {
  private readonly _s3Client: S3Client;
  private readonly _config: Required<FastlyStorageConfig>;
  private readonly _logger: Logger;
  private readonly _bucketOps: BucketOperations;
  private readonly _objectOps: ObjectOperations;
  private readonly _multipartOps: MultipartOperations;
  private readonly _presignedUrlOps: PresignedUrlOperations;

  /**
   * Creates a new Fastly Storage Client
   *
   * @param config - Configuration options
   *
   * @example
   * ```typescript
   * const client = new FastlyStorageClient({
   *   endpoint: 'https://your-endpoint.fastly.com',
   *   accessKeyId: 'your-access-key',
   *   secretAccessKey: 'your-secret-key',
   *   region: 'us-west-1'
   * });
   * ```
   */
  constructor(config: FastlyStorageConfig = {}) {
    this._config = this._mergeConfig(config);
    this._logger = this._config.logger || new DefaultLogger();

    validateConfig(this._config);

    this._s3Client = this._initializeS3Client();
    this._bucketOps = new BucketOperations(this._s3Client, this._logger);
    this._objectOps = new ObjectOperations(this._s3Client, this._logger);
    this._multipartOps = new MultipartOperations(this._s3Client, this._logger);
    this._presignedUrlOps = new PresignedUrlOperations(this._s3Client);

    this._logger.info('Fastly Storage Client initialized', {
      endpoint: this._config.endpoint,
      region: this._config.region,
    });
  }

  // ==================== Bucket Operations ====================

  /**
   * Creates a new bucket
   *
   * @param name - Bucket name
   * @param options - Bucket configuration options
   * @returns Promise that resolves when bucket is created
   *
   * @example
   * ```typescript
   * await client.createBucket('my-bucket', { region: 'us-west-1' });
   * ```
   */
  async createBucket(name: string, options?: BucketConfig): Promise<void> {
    return this._bucketOps.createBucket(name, options);
  }

  /**
   * Deletes a bucket (must be empty)
   *
   * @param name - Bucket name
   * @returns Promise that resolves when bucket is deleted
   */
  async deleteBucket(name: string): Promise<void> {
    return this._bucketOps.deleteBucket(name);
  }

  /**
   * Lists all buckets
   *
   * @returns Promise resolving to array of bucket information
   */
  async listBuckets(): Promise<BucketInfo[]> {
    return this._bucketOps.listBuckets();
  }

  /**
   * Gets bucket information
   *
   * @param name - Bucket name
   * @returns Promise resolving to bucket information
   */
  async getBucketInfo(name: string): Promise<BucketInfo> {
    return this._bucketOps.getBucketInfo(name);
  }

  // ==================== Object Operations ====================

  /**
   * Uploads an object to storage
   *
   * @param bucket - Bucket name
   * @param key - Object key (path)
   * @param data - Data to upload (Buffer, Stream, Blob, or string)
   * @param options - Upload options
   * @returns Promise resolving to upload result
   *
   * @example
   * ```typescript
   * const result = await client.uploadObject('my-bucket', 'file.txt', buffer, {
   *   contentType: 'text/plain',
   *   metadata: { author: 'user123' }
   * });
   * ```
   */
  async uploadObject(
    bucket: string,
    key: string,
    data: UploadData,
    options?: UploadObjectOptions
  ): Promise<UploadResult> {
    return this._objectOps.uploadObject(bucket, key, data, options);
  }

  /**
   * Downloads an object from storage
   *
   * @param bucket - Bucket name
   * @param key - Object key
   * @param options - Download options
   * @returns Promise resolving to download result with buffer
   *
   * @example
   * ```typescript
   * const data = await client.getObject('my-bucket', 'file.txt');
   * console.log(data.body.toString());
   * ```
   */
  async getObject(
    bucket: string,
    key: string,
    options?: GetObjectOptions
  ): Promise<DownloadResult> {
    return this._objectOps.getObject(bucket, key, options);
  }

  /**
   * Gets an object as a stream
   *
   * @param bucket - Bucket name
   * @param key - Object key
   * @param options - Download options
   * @returns Promise resolving to readable stream
   *
   * @example
   * ```typescript
   * const stream = await client.getObjectStream('my-bucket', 'large-file.mp4');
   * stream.pipe(fs.createWriteStream('output.mp4'));
   * ```
   */
  async getObjectStream(
    bucket: string,
    key: string,
    options?: GetObjectOptions
  ): Promise<Readable> {
    return this._objectOps.getObjectStream(bucket, key, options);
  }

  /**
   * Deletes an object
   *
   * @param bucket - Bucket name
   * @param key - Object key
   * @returns Promise that resolves when object is deleted
   */
  async deleteObject(bucket: string, key: string): Promise<void> {
    return this._objectOps.deleteObject(bucket, key);
  }

  /**
   * Copies an object
   *
   * @param sourceBucket - Source bucket name
   * @param sourceKey - Source object key
   * @param destBucket - Destination bucket name
   * @param destKey - Destination object key
   * @param options - Copy options
   * @returns Promise resolving to copy result
   */
  async copyObject(
    sourceBucket: string,
    sourceKey: string,
    destBucket: string,
    destKey: string,
    options?: CopyObjectOptions
  ): Promise<UploadResult> {
    return this._objectOps.copyObject(sourceBucket, sourceKey, destBucket, destKey, options);
  }

  /**
   * Gets object metadata without downloading the object
   *
   * @param bucket - Bucket name
   * @param key - Object key
   * @returns Promise resolving to object metadata
   */
  async headObject(bucket: string, key: string): Promise<ObjectMetadata> {
    return this._objectOps.headObject(bucket, key);
  }

  /**
   * Lists objects in a bucket
   *
   * @param bucket - Bucket name
   * @param options - List options
   * @returns Promise resolving to list result
   *
   * @example
   * ```typescript
   * const result = await client.listObjects('my-bucket', {
   *   prefix: 'uploads/',
   *   maxKeys: 100
   * });
   * ```
   */
  async listObjects(bucket: string, options?: ListObjectsOptions): Promise<ListObjectsResult> {
    return this._objectOps.listObjects(bucket, options);
  }

  // ==================== Multipart Operations ====================

  /**
   * Initiates a multipart upload
   *
   * @param bucket - Bucket name
   * @param key - Object key
   * @param options - Upload options
   * @returns Promise resolving to multipart upload result
   */
  async createMultipartUpload(
    bucket: string,
    key: string,
    options?: UploadObjectOptions
  ): Promise<MultipartUploadResult> {
    return this._multipartOps.createMultipartUpload(bucket, key, options);
  }

  /**
   * Uploads a part in a multipart upload
   *
   * @param uploadId - Upload ID from createMultipartUpload
   * @param partNumber - Part number (1-10000)
   * @param data - Part data
   * @returns Promise resolving to upload part result
   */
  async uploadPart(uploadId: string, partNumber: number, data: Buffer): Promise<UploadPartResult> {
    return this._multipartOps.uploadPart(uploadId, partNumber, data);
  }

  /**
   * Completes a multipart upload
   *
   * @param uploadId - Upload ID
   * @param parts - Array of uploaded parts
   * @returns Promise resolving to upload result
   */
  async completeMultipartUpload(uploadId: string, parts: UploadPart[]): Promise<UploadResult> {
    return this._multipartOps.completeMultipartUpload(uploadId, parts);
  }

  /**
   * Aborts a multipart upload
   *
   * @param uploadId - Upload ID
   * @returns Promise that resolves when upload is aborted
   */
  async abortMultipartUpload(uploadId: string): Promise<void> {
    return this._multipartOps.abortMultipartUpload(uploadId);
  }

  // ==================== Presigned URL Operations ====================

  /**
   * Generates a presigned URL for downloading an object
   *
   * @param bucket - Bucket name
   * @param key - Object key
   * @param expiresIn - Expiration time in seconds
   * @returns Promise resolving to presigned URL
   *
   * @example
   * ```typescript
   * const url = await client.getPresignedDownloadUrl('my-bucket', 'file.txt', 3600);
   * ```
   */
  async getPresignedDownloadUrl(bucket: string, key: string, expiresIn: number): Promise<string> {
    return this._presignedUrlOps.getPresignedDownloadUrl(bucket, key, expiresIn);
  }

  /**
   * Generates a presigned URL for uploading an object
   *
   * @param bucket - Bucket name
   * @param key - Object key
   * @param expiresIn - Expiration time in seconds
   * @returns Promise resolving to presigned URL
   */
  async getPresignedUploadUrl(bucket: string, key: string, expiresIn: number): Promise<string> {
    return this._presignedUrlOps.getPresignedUploadUrl(bucket, key, expiresIn);
  }

  // ==================== Private Methods ====================

  private _mergeConfig(config: FastlyStorageConfig): Required<FastlyStorageConfig> {
    return {
      endpoint: config.endpoint || process.env.FASTLY_ENDPOINT || '',
      accessKeyId: config.accessKeyId || process.env.FASTLY_ACCESS_KEY_ID || '',
      secretAccessKey: config.secretAccessKey || process.env.FASTLY_SECRET_ACCESS_KEY || '',
      region: config.region || process.env.FASTLY_REGION || 'us-east-1',
      maxRetries: config.maxRetries ?? 3,
      timeout: config.timeout ?? 30000,
      logger: config.logger || new DefaultLogger(),
      retryPolicy: config.retryPolicy || {
        maxRetries: 3,
        retryDelay: 1000,
        retryDelayMultiplier: 2,
      },
      forcePathStyle: config.forcePathStyle ?? true,
    };
  }

  private _initializeS3Client(): S3Client {
    const clientConfig: S3ClientConfig = {
      endpoint: this._config.endpoint,
      region: this._config.region,
      credentials: {
        accessKeyId: this._config.accessKeyId,
        secretAccessKey: this._config.secretAccessKey,
      },
      forcePathStyle: this._config.forcePathStyle,
      maxAttempts: this._config.maxRetries + 1,
      requestHandler: {
        requestTimeout: this._config.timeout,
      },
    };

    return new S3Client(clientConfig);
  }

  /**
   * Closes the client and cleans up resources
   */
  destroy(): void {
    this._s3Client.destroy();
    this._logger.info('Fastly Storage Client destroyed');
  }
}
