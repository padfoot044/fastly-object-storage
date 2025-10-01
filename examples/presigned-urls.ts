/**
 * Presigned URLs example
 */

import { FastlyStorageClient } from 'fastly-object-storage';

async function presignedUrlExample() {
  const client = new FastlyStorageClient({
    endpoint: process.env.FASTLY_ENDPOINT!,
    accessKeyId: process.env.FASTLY_ACCESS_KEY_ID!,
    secretAccessKey: process.env.FASTLY_SECRET_ACCESS_KEY!,
    region: process.env.FASTLY_REGION || 'us-east-1',
  });

  const bucket = 'my-bucket';
  const key = 'shared-file.txt';

  try {
    // Create bucket
    try {
      await client.createBucket(bucket);
    } catch (error) {
      console.log('Bucket already exists');
    }

    // Upload a file first
    await client.uploadObject(bucket, key, Buffer.from('This is a shared file'), {
      contentType: 'text/plain',
    });

    console.log('File uploaded');

    // Generate presigned download URL (valid for 1 hour)
    const downloadUrl = await client.getPresignedDownloadUrl(bucket, key, 3600);
    console.log('Presigned download URL:', downloadUrl);
    console.log('This URL is valid for 1 hour');

    // Generate presigned upload URL (valid for 30 minutes)
    const uploadUrl = await client.getPresignedUploadUrl(bucket, 'user-upload.txt', 1800);
    console.log('\nPresigned upload URL:', uploadUrl);
    console.log('This URL is valid for 30 minutes');

    // Example: Using the upload URL with fetch
    console.log('\nExample usage with fetch:');
    console.log(`
      const response = await fetch('${uploadUrl}', {
        method: 'PUT',
        body: yourFileData,
        headers: {
          'Content-Type': 'text/plain'
        }
      });
    `);

    // Clean up
    await client.deleteObject(bucket, key);
    await client.deleteBucket(bucket);
    console.log('\nCleanup completed');
  } catch (error) {
    console.error('Error:', error);
  } finally {
    client.destroy();
  }
}

// Run the example
presignedUrlExample().catch(console.error);
