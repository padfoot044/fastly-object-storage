/**
 * Streaming example for large files
 */

import { FastlyStorageClient } from 'fastly-object-storage';
import * as fs from 'fs';
import * as path from 'path';

async function streamingExample() {
  const client = new FastlyStorageClient({
    endpoint: process.env.FASTLY_ENDPOINT!,
    accessKeyId: process.env.FASTLY_ACCESS_KEY_ID!,
    secretAccessKey: process.env.FASTLY_SECRET_ACCESS_KEY!,
    region: process.env.FASTLY_REGION || 'us-east-1',
  });

  const bucket = 'streaming-test';
  const key = 'large-file.dat';

  try {
    // Create bucket
    try {
      await client.createBucket(bucket);
    } catch (error) {
      console.log('Bucket already exists');
    }

    // Upload from stream
    console.log('Uploading file from stream...');
    const uploadStream = fs.createReadStream(path.join(__dirname, 'large-file.dat'));

    await client.uploadObject(bucket, key, uploadStream, {
      contentType: 'application/octet-stream',
      onProgress: (progress) => {
        console.log(
          `Upload progress: ${progress.percentage.toFixed(2)}% (${progress.loaded}/${progress.total} bytes)`
        );
      },
    });

    console.log('Upload completed');

    // Download as stream
    console.log('\nDownloading file as stream...');
    const downloadStream = await client.getObjectStream(bucket, key);

    const outputPath = path.join(__dirname, 'downloaded-file.dat');
    const writeStream = fs.createWriteStream(outputPath);

    // Pipe the download stream to file
    await new Promise((resolve, reject) => {
      downloadStream.pipe(writeStream);
      downloadStream.on('error', reject);
      writeStream.on('error', reject);
      writeStream.on('finish', resolve);
    });

    console.log('Download completed:', outputPath);

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
streamingExample().catch(console.error);
