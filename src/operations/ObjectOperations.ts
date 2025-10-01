import {
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
  CopyObjectCommand,
  HeadObjectCommand,
  ListObjectsV2Command,
  S3Client,
} from '@aws-sdk/client-s3';
import { Readable } from 'stream';
import type {
  UploadObjectOptions,
  GetObjectOptions,
  ListObjectsOptions,
  ListObjectsResult,
  ObjectMetadata,
  UploadResult,
  CopyObjectOptions,
  UploadData,
  DownloadResult,
  Logger,
} from '../types';
import { FastlyStorageError } from '../errors/FastlyStorageError';
import { streamToBuffer } from '../utils/stream';

/**
 * Handles object-related operations
 */
export class ObjectOperations {
  constructor(
    private readonly client: S3Client,
    private readonly logger: Logger
  ) {}

  async uploadObject(
    bucket: string,
    key: string,
    data: UploadData,
    options?: UploadObjectOptions
  ): Promise<UploadResult> {
    try {
      this.logger.info('Uploading object', { bucket, key });

      const command = new PutObjectCommand({
        Bucket: bucket,
        Key: key,
        Body: data as Buffer | Readable,
        ContentType: options?.contentType,
        Metadata: options?.metadata,
        CacheControl: options?.cacheControl,
        ContentDisposition: options?.contentDisposition,
        ContentEncoding: options?.contentEncoding,
        ACL: options?.acl,
        ServerSideEncryption: options?.serverSideEncryption,
        StorageClass: options?.storageClass,
      });

      const response = await this.client.send(command);

      this.logger.info('Object uploaded successfully', { bucket, key, etag: response.ETag });

      return {
        etag: response.ETag,
        versionId: response.VersionId,
        serverSideEncryption: response.ServerSideEncryption,
      };
    } catch (error) {
      this.logger.error('Failed to upload object', { bucket, key, error });
      throw FastlyStorageError.fromS3Error(error as Error, {
        bucket,
        key,
        operation: 'uploadObject',
      });
    }
  }

  async getObject(
    bucket: string,
    key: string,
    options?: GetObjectOptions
  ): Promise<DownloadResult> {
    try {
      this.logger.info('Getting object', { bucket, key });

      const command = new GetObjectCommand({
        Bucket: bucket,
        Key: key,
        Range: options?.range,
        IfModifiedSince: options?.ifModifiedSince,
        IfUnmodifiedSince: options?.ifUnmodifiedSince,
        IfMatch: options?.ifMatch,
        IfNoneMatch: options?.ifNoneMatch,
      });

      const response = await this.client.send(command);

      if (!response.Body) {
        throw new FastlyStorageError('Empty response body', 'EMPTY_BODY', {
          context: { bucket, key },
        });
      }

      const body = await streamToBuffer(response.Body as Readable);

      this.logger.info('Object retrieved successfully', { bucket, key, size: body.length });

      return {
        body,
        contentType: response.ContentType,
        contentLength: response.ContentLength || body.length,
        etag: response.ETag || '',
        lastModified: response.LastModified || new Date(),
        metadata: response.Metadata || {},
      };
    } catch (error) {
      this.logger.error('Failed to get object', { bucket, key, error });
      throw FastlyStorageError.fromS3Error(error as Error, { bucket, key, operation: 'getObject' });
    }
  }

  async getObjectStream(
    bucket: string,
    key: string,
    options?: GetObjectOptions
  ): Promise<Readable> {
    try {
      this.logger.info('Getting object stream', { bucket, key });

      const command = new GetObjectCommand({
        Bucket: bucket,
        Key: key,
        Range: options?.range,
        IfModifiedSince: options?.ifModifiedSince,
        IfUnmodifiedSince: options?.ifUnmodifiedSince,
        IfMatch: options?.ifMatch,
        IfNoneMatch: options?.ifNoneMatch,
      });

      const response = await this.client.send(command);

      if (!response.Body) {
        throw new FastlyStorageError('Empty response body', 'EMPTY_BODY', {
          context: { bucket, key },
        });
      }

      this.logger.info('Object stream retrieved successfully', { bucket, key });

      return response.Body as Readable;
    } catch (error) {
      this.logger.error('Failed to get object stream', { bucket, key, error });
      throw FastlyStorageError.fromS3Error(error as Error, {
        bucket,
        key,
        operation: 'getObjectStream',
      });
    }
  }

  async deleteObject(bucket: string, key: string): Promise<void> {
    try {
      this.logger.info('Deleting object', { bucket, key });

      const command = new DeleteObjectCommand({
        Bucket: bucket,
        Key: key,
      });

      await this.client.send(command);

      this.logger.info('Object deleted successfully', { bucket, key });
    } catch (error) {
      this.logger.error('Failed to delete object', { bucket, key, error });
      throw FastlyStorageError.fromS3Error(error as Error, {
        bucket,
        key,
        operation: 'deleteObject',
      });
    }
  }

  async copyObject(
    sourceBucket: string,
    sourceKey: string,
    destBucket: string,
    destKey: string,
    options?: CopyObjectOptions
  ): Promise<UploadResult> {
    try {
      this.logger.info('Copying object', {
        sourceBucket,
        sourceKey,
        destBucket,
        destKey,
      });

      const command = new CopyObjectCommand({
        Bucket: destBucket,
        Key: destKey,
        CopySource: `${sourceBucket}/${sourceKey}`,
        MetadataDirective: options?.metadataDirective,
        Metadata: options?.metadata,
        ContentType: options?.contentType,
        ACL: options?.acl,
        CopySourceIfModifiedSince: options?.copySourceIfModifiedSince,
        CopySourceIfUnmodifiedSince: options?.copySourceIfUnmodifiedSince,
      });

      const response = await this.client.send(command);

      this.logger.info('Object copied successfully', {
        sourceBucket,
        sourceKey,
        destBucket,
        destKey,
      });

      return {
        etag: response.CopyObjectResult?.ETag,
        versionId: response.VersionId,
      };
    } catch (error) {
      this.logger.error('Failed to copy object', {
        sourceBucket,
        sourceKey,
        destBucket,
        destKey,
        error,
      });
      throw FastlyStorageError.fromS3Error(error as Error, {
        sourceBucket,
        sourceKey,
        destBucket,
        destKey,
        operation: 'copyObject',
      });
    }
  }

  async headObject(bucket: string, key: string): Promise<ObjectMetadata> {
    try {
      this.logger.debug('Getting object metadata', { bucket, key });

      const command = new HeadObjectCommand({
        Bucket: bucket,
        Key: key,
      });

      const response = await this.client.send(command);

      this.logger.debug('Object metadata retrieved successfully', { bucket, key });

      return {
        contentType: response.ContentType,
        contentLength: response.ContentLength || 0,
        lastModified: response.LastModified || new Date(),
        etag: response.ETag || '',
        metadata: response.Metadata || {},
        cacheControl: response.CacheControl,
        contentDisposition: response.ContentDisposition,
        contentEncoding: response.ContentEncoding,
        versionId: response.VersionId,
        storageClass: response.StorageClass,
      };
    } catch (error) {
      this.logger.error('Failed to get object metadata', { bucket, key, error });
      throw FastlyStorageError.fromS3Error(error as Error, {
        bucket,
        key,
        operation: 'headObject',
      });
    }
  }

  async listObjects(bucket: string, options?: ListObjectsOptions): Promise<ListObjectsResult> {
    try {
      this.logger.debug('Listing objects', { bucket, options });

      const command = new ListObjectsV2Command({
        Bucket: bucket,
        Prefix: options?.prefix,
        Delimiter: options?.delimiter,
        MaxKeys: options?.maxKeys,
        ContinuationToken: options?.continuationToken,
        StartAfter: options?.startAfter,
      });

      const response = await this.client.send(command);

      const result: ListObjectsResult = {
        contents: (response.Contents || []).map(
          (obj: {
            Key?: string;
            LastModified?: Date;
            ETag?: string;
            Size?: number;
            StorageClass?: string;
            Owner?: { ID?: string; DisplayName?: string };
          }) => ({
            key: obj.Key!,
            lastModified: obj.LastModified!,
            etag: obj.ETag!,
            size: obj.Size!,
            storageClass: obj.StorageClass!,
            owner: obj.Owner
              ? {
                  id: obj.Owner.ID!,
                  displayName: obj.Owner.DisplayName!,
                }
              : undefined,
          })
        ),
        commonPrefixes: (response.CommonPrefixes || []).map(
          (cp: { Prefix?: string }) => cp.Prefix!
        ),
        isTruncated: response.IsTruncated || false,
        nextContinuationToken: response.NextContinuationToken,
        name: response.Name!,
        prefix: response.Prefix,
        maxKeys: response.MaxKeys!,
        keyCount: response.KeyCount!,
      };

      this.logger.debug('Objects listed successfully', {
        bucket,
        count: result.contents.length,
      });

      return result;
    } catch (error) {
      this.logger.error('Failed to list objects', { bucket, error });
      throw FastlyStorageError.fromS3Error(error as Error, { bucket, operation: 'listObjects' });
    }
  }
}
