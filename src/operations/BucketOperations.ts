import {
  CreateBucketCommand,
  DeleteBucketCommand,
  ListBucketsCommand,
  HeadBucketCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import type { BucketConfig, BucketInfo, Logger } from '../types';
import { FastlyStorageError } from '../errors/FastlyStorageError';

/**
 * Handles bucket-related operations
 */
export class BucketOperations {
  constructor(
    private readonly client: S3Client,
    private readonly logger: Logger
  ) {}

  async createBucket(name: string, options?: BucketConfig): Promise<void> {
    try {
      this.logger.info('Creating bucket', { bucket: name });

      const command = new CreateBucketCommand({
        Bucket: name,
        ACL: options?.acl,
        CreateBucketConfiguration: options?.region
          ? // Suppress type error for region - S3 SDK has strict enums but Fastly may use different regions
            // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-assignment
            { LocationConstraint: options.region as any }
          : undefined,
      });

      await this.client.send(command);
      this.logger.info('Bucket created successfully', { bucket: name });
    } catch (error) {
      this.logger.error('Failed to create bucket', { bucket: name, error });
      throw FastlyStorageError.fromS3Error(error as Error, {
        bucket: name,
        operation: 'createBucket',
      });
    }
  }

  async deleteBucket(name: string): Promise<void> {
    try {
      this.logger.info('Deleting bucket', { bucket: name });

      const command = new DeleteBucketCommand({ Bucket: name });
      await this.client.send(command);

      this.logger.info('Bucket deleted successfully', { bucket: name });
    } catch (error) {
      this.logger.error('Failed to delete bucket', { bucket: name, error });
      throw FastlyStorageError.fromS3Error(error as Error, {
        bucket: name,
        operation: 'deleteBucket',
      });
    }
  }

  async listBuckets(): Promise<BucketInfo[]> {
    try {
      this.logger.debug('Listing buckets');

      const command = new ListBucketsCommand({});
      const response = await this.client.send(command);

      const buckets: BucketInfo[] = (response.Buckets || []).map(
        (bucket: { Name?: string; CreationDate?: Date }) => ({
          name: bucket.Name!,
          creationDate: bucket.CreationDate!,
        })
      );

      this.logger.debug('Buckets listed successfully', { count: buckets.length });
      return buckets;
    } catch (error) {
      this.logger.error('Failed to list buckets', { error });
      throw FastlyStorageError.fromS3Error(error as Error, { operation: 'listBuckets' });
    }
  }

  async getBucketInfo(name: string): Promise<BucketInfo> {
    try {
      this.logger.debug('Getting bucket info', { bucket: name });

      const command = new HeadBucketCommand({ Bucket: name });
      await this.client.send(command);

      // HeadBucket doesn't return creation date, so we need to list all buckets
      const buckets = await this.listBuckets();
      const bucket = buckets.find((b) => b.name === name);

      if (!bucket) {
        throw new FastlyStorageError('Bucket not found', 'NOT_FOUND', {
          statusCode: 404,
          context: { bucket: name },
        });
      }

      this.logger.debug('Bucket info retrieved successfully', { bucket: name });
      return bucket;
    } catch (error) {
      this.logger.error('Failed to get bucket info', { bucket: name, error });
      throw FastlyStorageError.fromS3Error(error as Error, {
        bucket: name,
        operation: 'getBucketInfo',
      });
    }
  }
}
