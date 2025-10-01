/**
 * Basic usage example
 */

import { FastlyStorageClient } from 'fastly-object-storage';

async function basicExample() {
  // Initialize client
  const client = new FastlyStorageClient({
    endpoint: 'https://your-endpoint.fastly.com',
    accessKeyId: 'your-access-key',
    secretAccessKey: 'your-secret-key',
    region: 'us-west-1',
  });

  try {
    // Create a bucket
    await client.createBucket('my-bucket');
    console.log('Bucket created successfully');

    // Upload an object
    const uploadResult = await client.uploadObject(
      'my-bucket',
      'hello.txt',
      Buffer.from('Hello, Fastly Object Storage!'),
      {
        contentType: 'text/plain',
        metadata: {
          author: 'developer',
          version: '1.0',
        },
      }
    );
    console.log('Object uploaded:', uploadResult);

    // Download the object
    const downloadResult = await client.getObject('my-bucket', 'hello.txt');
    console.log('Downloaded content:', downloadResult.body.toString());
    console.log('Metadata:', downloadResult.metadata);

    // List objects in bucket
    const listResult = await client.listObjects('my-bucket');
    console.log('Objects in bucket:', listResult.contents.length);

    // Get object metadata
    const metadata = await client.headObject('my-bucket', 'hello.txt');
    console.log('Object metadata:', metadata);

    // Delete the object
    await client.deleteObject('my-bucket', 'hello.txt');
    console.log('Object deleted');

    // Delete the bucket
    await client.deleteBucket('my-bucket');
    console.log('Bucket deleted');
  } catch (error) {
    console.error('Error:', error);
  } finally {
    // Clean up
    client.destroy();
  }
}

// Run the example
basicExample().catch(console.error);
