/**
 * Multipart upload example for large files
 */

import { FastlyStorageClient } from 'fastly-object-storage';
import * as fs from 'fs';
import * as path from 'path';

async function multipartUploadExample() {
  const client = new FastlyStorageClient({
    endpoint: process.env.FASTLY_ENDPOINT!,
    accessKeyId: process.env.FASTLY_ACCESS_KEY_ID!,
    secretAccessKey: process.env.FASTLY_SECRET_ACCESS_KEY!,
    region: process.env.FASTLY_REGION || 'us-east-1',
  });

  const bucket = 'my-large-files';
  const key = 'large-video.mp4';
  const filePath = path.join(__dirname, 'large-file.mp4');

  try {
    // Create bucket if it doesn't exist
    try {
      await client.createBucket(bucket);
    } catch (error) {
      // Bucket might already exist
      console.log('Bucket already exists or creation failed');
    }

    // Initialize multipart upload
    const { uploadId } = await client.createMultipartUpload(bucket, key, {
      contentType: 'video/mp4',
      metadata: {
        uploader: 'example-script',
        uploadDate: new Date().toISOString(),
      },
    });

    console.log('Multipart upload initiated:', uploadId);

    // Read file and split into parts
    const fileSize = fs.statSync(filePath).size;
    const partSize = 5 * 1024 * 1024; // 5MB parts
    const numParts = Math.ceil(fileSize / partSize);

    console.log(`Uploading ${numParts} parts...`);

    const parts = [];
    const fileStream = fs.createReadStream(filePath, { highWaterMark: partSize });

    let partNumber = 1;
    for await (const chunk of fileStream) {
      console.log(`Uploading part ${partNumber}/${numParts}...`);

      const result = await client.uploadPart(uploadId, partNumber, chunk as Buffer);

      parts.push({
        partNumber,
        etag: result.etag,
      });

      partNumber++;
    }

    // Complete the multipart upload
    const completeResult = await client.completeMultipartUpload(uploadId, parts);
    console.log('Multipart upload completed:', completeResult);

    // Verify the upload
    const metadata = await client.headObject(bucket, key);
    console.log('Uploaded file size:', metadata.contentLength);
  } catch (error) {
    console.error('Error during multipart upload:', error);

    // Abort the upload if there's an error
    // Note: In a real scenario, you'd want to track the uploadId
    // and abort it in the catch block
  } finally {
    client.destroy();
  }
}

// Run the example
multipartUploadExample().catch(console.error);
