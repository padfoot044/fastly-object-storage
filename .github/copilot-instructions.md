# GitHub Copilot Instructions for fastly-object-storage

## Project Overview
This is a TypeScript SDK for Fastly Object Storage, providing S3-compatible APIs for cloud object storage operations. The SDK is designed to be modern, type-safe, and developer-friendly.

## Code Style & Standards

### TypeScript Guidelines
- **Strict typing**: Never use `any`. Use proper types or generics.
- **Explicit returns**: Function return types should be explicit for public APIs.
- **Null safety**: Use strict null checks. Prefer `undefined` over `null`.
- **Async/Await**: All async operations use promises with async/await syntax.

### Naming Conventions
- **Classes**: PascalCase (e.g., `FastlyStorageClient`)
- **Interfaces/Types**: PascalCase with descriptive names (e.g., `UploadObjectOptions`)
- **Functions/Methods**: camelCase (e.g., `uploadObject`, `listBuckets`)
- **Constants**: UPPER_SNAKE_CASE (e.g., `DEFAULT_TIMEOUT`)
- **Private members**: Prefix with `_` (e.g., `_client`)

### File Organization
```
src/
├── index.ts              # Main export file
├── client.ts             # FastlyStorageClient class
├── types/                # Type definitions
├── operations/           # API operations (buckets, objects, multipart)
├── utils/                # Utility functions
├── errors/               # Custom error classes
└── __tests__/            # Test files
```

## Architecture Patterns

### Client Design
- Use composition over inheritance
- Separate concerns: client initialization, operations, utilities
- Support method chaining where appropriate
- Implement builder pattern for complex options

### Error Handling
- Create custom error classes extending base Error
- Include status codes, error codes, and descriptive messages
- Wrap S3 SDK errors with our custom errors
- Provide error context (bucket, key, operation)

### Configuration
- Support environment variables with `FASTLY_` prefix
- Provide sensible defaults
- Validate configuration on initialization
- Support both constructor params and config objects

## Testing Requirements

### Test Coverage
- Aim for 80%+ code coverage
- Unit tests for all public methods
- Integration tests with mocked S3 client
- Edge case testing (large files, errors, retries)

### Test Structure
```typescript
describe('FastlyStorageClient', () => {
  describe('uploadObject', () => {
    it('should upload a buffer successfully', async () => {
      // Arrange
      // Act
      // Assert
    });
  });
});
```

## API Design Principles

### Method Signatures
```typescript
// Good: Clear, typed, with options
async uploadObject(
  bucket: string,
  key: string,
  data: Buffer | Readable | Blob,
  options?: UploadObjectOptions
): Promise<UploadResult>

// Bad: Too many required params, unclear types
async upload(b: string, k: string, d: any, ct: string, m: any): Promise<any>
```

### Options Objects
- Use optional parameters objects for 3+ params
- Provide sensible defaults
- Document all options with JSDoc
- Support both camelCase and common S3 naming

### Return Types
- Return meaningful objects, not just success/failure
- Include metadata (ETag, VersionId, etc.)
- Support streaming responses for downloads
- Consistent error shapes

## Dependencies

### Core Dependencies
- `@aws-sdk/client-s3`: S3 client implementation
- `@aws-sdk/s3-request-presigner`: Presigned URL generation

### Dev Dependencies
- TypeScript for type safety
- Jest for testing
- ESLint + Prettier for code quality
- Husky for pre-commit hooks
- tsup for building

## Documentation Standards

### JSDoc Comments
```typescript
/**
 * Uploads an object to Fastly Object Storage.
 *
 * @param bucket - The name of the bucket
 * @param key - The object key (path)
 * @param data - The data to upload (Buffer, Stream, or Blob)
 * @param options - Optional upload configuration
 * @returns Promise resolving to upload result with ETag and metadata
 * @throws {FastlyStorageError} When upload fails
 *
 * @example
 * ```typescript
 * const result = await client.uploadObject('my-bucket', 'file.txt', buffer, {
 *   contentType: 'text/plain',
 *   metadata: { author: 'user123' }
 * });
 * ```
 */
```

## Features to Implement

### Priority 1 (Core)
- Client initialization with config
- Bucket operations (create, delete, list)
- Object operations (upload, download, delete, copy)
- Error handling and retries

### Priority 2 (Enhanced)
- Multipart uploads for large files
- Presigned URLs
- Streaming support
- Metadata and headers

### Priority 3 (Advanced)
- Progress callbacks
- Request cancellation
- Logging hooks
- Custom retry policies

## Environment Variables
```
FASTLY_ACCESS_KEY_ID
FASTLY_SECRET_ACCESS_KEY
FASTLY_ENDPOINT
FASTLY_REGION
```

## When Generating Code

1. **Always include types**: No implicit any, use generics when needed
2. **Error handling**: Wrap operations in try-catch, throw custom errors
3. **Async patterns**: Use async/await, handle promise rejections
4. **Validation**: Validate inputs before API calls
5. **Documentation**: Add JSDoc with examples
6. **Tests**: Suggest test cases for new features
7. **Backwards compatibility**: Don't break existing APIs without major version bump

## Example Code Pattern

```typescript
export class FastlyStorageClient {
  private readonly _s3Client: S3Client;
  private readonly _config: FastlyStorageConfig;

  constructor(config: FastlyStorageConfig) {
    this._config = this._validateConfig(config);
    this._s3Client = this._initializeClient();
  }

  async uploadObject(
    bucket: string,
    key: string,
    data: Buffer | Readable,
    options?: UploadObjectOptions
  ): Promise<UploadResult> {
    try {
      this._validateBucketName(bucket);
      this._validateKey(key);

      const command = new PutObjectCommand({
        Bucket: bucket,
        Key: key,
        Body: data,
        ContentType: options?.contentType,
        Metadata: options?.metadata,
      });

      const response = await this._s3Client.send(command);

      return {
        etag: response.ETag,
        versionId: response.VersionId,
      };
    } catch (error) {
      throw new FastlyStorageError(
        `Failed to upload object: ${key}`,
        'UPLOAD_FAILED',
        { bucket, key, cause: error }
      );
    }
  }
}
```

## Performance Considerations
- Stream large files instead of loading into memory
- Implement connection pooling
- Support concurrent operations
- Use multipart upload for files > 5MB
- Implement request throttling

## Security Guidelines
- Never log credentials
- Support credential rotation
- Validate all inputs
- Use HTTPS for all requests
- Support IAM roles and temporary credentials
