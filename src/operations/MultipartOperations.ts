import {
  CreateMultipartUploadCommand,
  UploadPartCommand,
  CompleteMultipartUploadCommand,
  AbortMultipartUploadCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import type {
  UploadObjectOptions,
  MultipartUploadResult,
  UploadPartResult,
  UploadPart,
  UploadResult,
  Logger,
} from '../types';
import { FastlyStorageError } from '../errors/FastlyStorageError';

interface MultipartUploadState {
  uploadId: string;
  bucket: string;
  key: string;
}

/**
 * Handles multipart upload operations
 */
export class MultipartOperations {
  private readonly uploads: Map<string, MultipartUploadState> = new Map();

  constructor(
    private readonly client: S3Client,
    private readonly logger: Logger
  ) {}

  async createMultipartUpload(
    bucket: string,
    key: string,
    options?: UploadObjectOptions
  ): Promise<MultipartUploadResult> {
    try {
      this.logger.info('Creating multipart upload', { bucket, key });

      const command = new CreateMultipartUploadCommand({
        Bucket: bucket,
        Key: key,
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

      if (!response.UploadId) {
        throw new FastlyStorageError('No upload ID returned', 'NO_UPLOAD_ID', {
          context: { bucket, key },
        });
      }

      const uploadId = response.UploadId;
      this.uploads.set(uploadId, { uploadId, bucket, key });

      this.logger.info('Multipart upload created successfully', {
        bucket,
        key,
        uploadId,
      });

      return { uploadId, bucket, key };
    } catch (error) {
      this.logger.error('Failed to create multipart upload', { bucket, key, error });
      throw FastlyStorageError.fromS3Error(error as Error, {
        bucket,
        key,
        operation: 'createMultipartUpload',
      });
    }
  }

  async uploadPart(uploadId: string, partNumber: number, data: Buffer): Promise<UploadPartResult> {
    const uploadState = this.uploads.get(uploadId);
    if (!uploadState) {
      throw new FastlyStorageError('Upload ID not found', 'UPLOAD_NOT_FOUND', {
        context: { uploadId },
      });
    }

    try {
      this.logger.debug('Uploading part', {
        uploadId,
        partNumber,
        size: data.length,
      });

      const command = new UploadPartCommand({
        Bucket: uploadState.bucket,
        Key: uploadState.key,
        UploadId: uploadId,
        PartNumber: partNumber,
        Body: data,
      });

      const response = await this.client.send(command);

      if (!response.ETag) {
        throw new FastlyStorageError('No ETag returned', 'NO_ETAG', {
          context: { uploadId, partNumber },
        });
      }

      this.logger.debug('Part uploaded successfully', {
        uploadId,
        partNumber,
        etag: response.ETag,
      });

      return {
        partNumber,
        etag: response.ETag,
      };
    } catch (error) {
      this.logger.error('Failed to upload part', { uploadId, partNumber, error });
      throw FastlyStorageError.fromS3Error(error as Error, {
        uploadId,
        partNumber,
        operation: 'uploadPart',
      });
    }
  }

  async completeMultipartUpload(uploadId: string, parts: UploadPart[]): Promise<UploadResult> {
    const uploadState = this.uploads.get(uploadId);
    if (!uploadState) {
      throw new FastlyStorageError('Upload ID not found', 'UPLOAD_NOT_FOUND', {
        context: { uploadId },
      });
    }

    try {
      this.logger.info('Completing multipart upload', {
        uploadId,
        partCount: parts.length,
      });

      const command = new CompleteMultipartUploadCommand({
        Bucket: uploadState.bucket,
        Key: uploadState.key,
        UploadId: uploadId,
        MultipartUpload: {
          Parts: parts.map((part) => ({
            PartNumber: part.partNumber,
            ETag: part.etag,
          })),
        },
      });

      const response = await this.client.send(command);

      this.uploads.delete(uploadId);

      this.logger.info('Multipart upload completed successfully', {
        uploadId,
        location: response.Location,
      });

      return {
        etag: response.ETag,
        versionId: response.VersionId,
        location: response.Location,
      };
    } catch (error) {
      this.logger.error('Failed to complete multipart upload', { uploadId, error });
      throw FastlyStorageError.fromS3Error(error as Error, {
        uploadId,
        operation: 'completeMultipartUpload',
      });
    }
  }

  async abortMultipartUpload(uploadId: string): Promise<void> {
    const uploadState = this.uploads.get(uploadId);
    if (!uploadState) {
      throw new FastlyStorageError('Upload ID not found', 'UPLOAD_NOT_FOUND', {
        context: { uploadId },
      });
    }

    try {
      this.logger.info('Aborting multipart upload', { uploadId });

      const command = new AbortMultipartUploadCommand({
        Bucket: uploadState.bucket,
        Key: uploadState.key,
        UploadId: uploadId,
      });

      await this.client.send(command);

      this.uploads.delete(uploadId);

      this.logger.info('Multipart upload aborted successfully', { uploadId });
    } catch (error) {
      this.logger.error('Failed to abort multipart upload', { uploadId, error });
      throw FastlyStorageError.fromS3Error(error as Error, {
        uploadId,
        operation: 'abortMultipartUpload',
      });
    }
  }
}
