# Fastly Object Storage SDK

A modern, feature-rich TypeScript SDK for Fastly Object Storage with full S3-compatible API support.

[![npm version](https://badge.fury.io/js/fastly-object-storage.svg)](https://www.npmjs.com/package/fastly-object-storage)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue.svg)](https://www.typescriptlang.org/)

## Features

- 🚀 **Modern TypeScript** - Full type safety with comprehensive TypeScript definitions
- 🔄 **S3-Compatible** - Drop-in replacement for S3 SDK operations
- 📦 **Complete API Coverage** - Buckets, objects, multipart uploads, presigned URLs
- 🌊 **Streaming Support** - Efficient handling of large files with streams
- ⚡ **Performance Optimized** - Built-in retry logic, connection pooling
- 🛡️ **Error Handling** - Rich error objects with detailed context
- 🔌 **Pluggable Architecture** - Custom logging, metrics, middleware
- 📖 **Well Documented** - Extensive examples and API documentation
- ✅ **Tested** - Comprehensive test coverage

## Installation

```bash
npm install fastly-object-storage
```

```bash
yarn add fastly-object-storage
```

```bash
pnpm add fastly-object-storage
```

## Quick Start

```typescript
import { FastlyStorageClient } from 'fastly-object-storage';

// Initialize client
const client = new FastlyStorageClient({
  endpoint: 'https://your-endpoint.fastly.com',
  accessKeyId: 'your-access-key',
  secretAccessKey: 'your-secret-key',
  region: 'us-west-1',
});

// Upload an object
const uploadResult = await client.uploadObject('my-bucket', 'hello.txt', 
  Buffer.from('Hello, World!'), {
    contentType: 'text/plain',
    metadata: { author: 'developer' }
  }
);

// Download an object
const data = await client.getObject('my-bucket', 'hello.txt');

// List objects
const objects = await client.listObjects('my-bucket', { prefix: 'uploads/' });

// Generate presigned URL
const url = await client.getPresignedDownloadUrl('my-bucket', 'hello.txt', 3600);
```

## Configuration

### Constructor Options

```typescript
const client = new FastlyStorageClient({
  endpoint: 'https://your-endpoint.fastly.com',  // Required
  accessKeyId: 'your-access-key',                // Required
  secretAccessKey: 'your-secret-key',            // Required
  region: 'us-west-1',                           // Optional, default: 'us-east-1'
  maxRetries: 3,                                 // Optional, default: 3
  timeout: 30000,                                // Optional, default: 30000ms
  logger: customLogger,                          // Optional
});
```

### Environment Variables

```bash
FASTLY_ACCESS_KEY_ID=your-access-key
FASTLY_SECRET_ACCESS_KEY=your-secret-key
FASTLY_ENDPOINT=https://your-endpoint.fastly.com
FASTLY_REGION=us-west-1
```

```typescript
// Automatically loads from environment variables
const client = new FastlyStorageClient();
```

## API Reference

### Bucket Operations

#### `createBucket(name, options?)`
Creates a new bucket.

```typescript
await client.createBucket('my-bucket', {
  acl: 'private',
  region: 'us-west-1'
});
```

#### `deleteBucket(name)`
Deletes an empty bucket.

```typescript
await client.deleteBucket('my-bucket');
```

#### `listBuckets()`
Lists all buckets.

```typescript
const buckets = await client.listBuckets();
```

#### `getBucketInfo(name)`
Gets bucket metadata.

```typescript
const info = await client.getBucketInfo('my-bucket');
```

### Object Operations

#### `uploadObject(bucket, key, data, options?)`
Uploads an object to storage.

```typescript
// Upload from Buffer
await client.uploadObject('my-bucket', 'file.txt', buffer, {
  contentType: 'text/plain',
  metadata: { version: '1.0' }
});

// Upload from Stream
const stream = fs.createReadStream('large-file.mp4');
await client.uploadObject('my-bucket', 'video.mp4', stream, {
  contentType: 'video/mp4'
});
```

#### `getObject(bucket, key, options?)`
Downloads an object.

```typescript
// Get as Buffer
const data = await client.getObject('my-bucket', 'file.txt');

// Get as Stream
const stream = await client.getObjectStream('my-bucket', 'large-file.mp4');
stream.pipe(fs.createWriteStream('output.mp4'));
```

#### `deleteObject(bucket, key)`
Deletes an object.

```typescript
await client.deleteObject('my-bucket', 'old-file.txt');
```

#### `copyObject(sourceBucket, sourceKey, destBucket, destKey, options?)`
Copies an object.

```typescript
await client.copyObject('source-bucket', 'file.txt', 'dest-bucket', 'copy.txt');
```

#### `headObject(bucket, key)`
Gets object metadata without downloading.

```typescript
const metadata = await client.headObject('my-bucket', 'file.txt');
console.log(metadata.contentLength, metadata.lastModified);
```

### Listing Operations

#### `listObjects(bucket, options?)`
Lists objects in a bucket.

```typescript
const result = await client.listObjects('my-bucket', {
  prefix: 'uploads/',
  maxKeys: 1000,
  delimiter: '/'
});

// Pagination
let continuationToken: string | undefined;
do {
  const result = await client.listObjects('my-bucket', {
    continuationToken,
    maxKeys: 100
  });
  
  // Process result.contents
  
  continuationToken = result.nextContinuationToken;
} while (continuationToken);
```

### Multipart Uploads

For large files (>5MB recommended).

```typescript
// Start multipart upload
const { uploadId } = await client.createMultipartUpload('my-bucket', 'large-file.zip');

// Upload parts
const parts = [];
for (let i = 0; i < partCount; i++) {
  const partData = getPartData(i); // Your logic
  const result = await client.uploadPart(uploadId, i + 1, partData);
  parts.push({ partNumber: i + 1, etag: result.etag });
}

// Complete upload
await client.completeMultipartUpload(uploadId, parts);

// Or abort if needed
await client.abortMultipartUpload(uploadId);
```

### Presigned URLs

Generate temporary URLs for direct upload/download.

```typescript
// Download URL (valid for 1 hour)
const downloadUrl = await client.getPresignedDownloadUrl('my-bucket', 'file.txt', 3600);

// Upload URL (valid for 30 minutes)
const uploadUrl = await client.getPresignedUploadUrl('my-bucket', 'upload.txt', 1800);

// Client can now upload directly
await fetch(uploadUrl, {
  method: 'PUT',
  body: fileData,
  headers: { 'Content-Type': 'text/plain' }
});
```

## Advanced Usage

### Custom Retry Policy

```typescript
const client = new FastlyStorageClient({
  endpoint: 'https://your-endpoint.fastly.com',
  accessKeyId: 'your-access-key',
  secretAccessKey: 'your-secret-key',
  maxRetries: 5,
  retryDelay: 1000,
  retryDelayMultiplier: 2
});
```

### Custom Logger

```typescript
const customLogger = {
  debug: (msg: string, meta?: unknown) => console.log('[DEBUG]', msg, meta),
  info: (msg: string, meta?: unknown) => console.log('[INFO]', msg, meta),
  warn: (msg: string, meta?: unknown) => console.warn('[WARN]', msg, meta),
  error: (msg: string, meta?: unknown) => console.error('[ERROR]', msg, meta),
};

const client = new FastlyStorageClient({
  // ... config
  logger: customLogger
});
```

### Progress Tracking

```typescript
await client.uploadObject('my-bucket', 'large-file.zip', stream, {
  onProgress: (progress) => {
    console.log(`Upload progress: ${progress.percentage}%`);
    console.log(`${progress.loaded} / ${progress.total} bytes`);
  }
});
```

### Request Cancellation

```typescript
const controller = new AbortController();

// Start upload
const uploadPromise = client.uploadObject('my-bucket', 'file.txt', data, {
  abortSignal: controller.signal
});

// Cancel after 5 seconds
setTimeout(() => controller.abort(), 5000);

try {
  await uploadPromise;
} catch (error) {
  if (error.name === 'AbortError') {
    console.log('Upload cancelled');
  }
}
```

## Error Handling

```typescript
import { FastlyStorageError } from 'fastly-object-storage';

try {
  await client.getObject('my-bucket', 'non-existent.txt');
} catch (error) {
  if (error instanceof FastlyStorageError) {
    console.error('Error code:', error.code);
    console.error('Status code:', error.statusCode);
    console.error('Message:', error.message);
    console.error('Context:', error.context);
  }
}
```

## TypeScript Support

Full TypeScript definitions included:

```typescript
import type {
  FastlyStorageConfig,
  UploadObjectOptions,
  UploadResult,
  ListObjectsResult,
  ObjectMetadata,
  MultipartUploadResult,
} from 'fastly-object-storage';
```

## Development

```bash
# Install dependencies
npm install

# Run tests
npm test

# Run tests in watch mode
npm run test:watch

# Build
npm run build

# Lint
npm run lint

# Format
npm run format
```

## Contributing

Contributions are welcome! Please read our [Contributing Guide](CONTRIBUTING.md) for details.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

MIT © [Your Name]

## Support

- 📖 [Documentation](https://github.com/yourusername/fastly-object-storage/wiki)
- 🐛 [Issue Tracker](https://github.com/yourusername/fastly-object-storage/issues)
- 💬 [Discussions](https://github.com/yourusername/fastly-object-storage/discussions)

## Acknowledgments

Built with:
- [AWS SDK for JavaScript v3](https://github.com/aws/aws-sdk-js-v3)
- [TypeScript](https://www.typescriptlang.org/)
