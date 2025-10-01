import { GetObjectCommand, PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { FastlyStorageError } from '../errors/FastlyStorageError';

/**
 * Handles presigned URL operations
 */
export class PresignedUrlOperations {
  constructor(private readonly client: S3Client) {}

  async getPresignedDownloadUrl(bucket: string, key: string, expiresIn: number): Promise<string> {
    try {
      const command = new GetObjectCommand({
        Bucket: bucket,
        Key: key,
      });

      const url = await getSignedUrl(this.client, command, { expiresIn });

      return url;
    } catch (error) {
      throw FastlyStorageError.fromS3Error(error as Error, {
        bucket,
        key,
        operation: 'getPresignedDownloadUrl',
      });
    }
  }

  async getPresignedUploadUrl(bucket: string, key: string, expiresIn: number): Promise<string> {
    try {
      const command = new PutObjectCommand({
        Bucket: bucket,
        Key: key,
      });

      const url = await getSignedUrl(this.client, command, { expiresIn });

      return url;
    } catch (error) {
      throw FastlyStorageError.fromS3Error(error as Error, {
        bucket,
        key,
        operation: 'getPresignedUploadUrl',
      });
    }
  }
}
