import { Readable } from 'stream';

/**
 * Converts a readable stream to a buffer
 */
export async function streamToBuffer(stream: Readable): Promise<Buffer> {
  return new Promise<Buffer>((resolve, reject) => {
    const chunks: Buffer[] = [];

    stream.on('data', (chunk: Buffer) => {
      chunks.push(chunk);
    });

    stream.on('error', (error: Error) => {
      reject(error);
    });

    stream.on('end', () => {
      resolve(Buffer.concat(chunks));
    });
  });
}

/**
 * Converts a buffer to a readable stream
 */
export function bufferToStream(buffer: Buffer): Readable {
  const stream = new Readable();
  stream.push(buffer);
  stream.push(null);
  return stream;
}
