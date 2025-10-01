import { FastlyStorageClient } from '../client';
import { FastlyStorageError } from '../errors/FastlyStorageError';

describe('FastlyStorageClient', () => {
  describe('constructor', () => {
    it('should create client with config', () => {
      const client = new FastlyStorageClient({
        endpoint: 'https://example.com',
        accessKeyId: 'test-key',
        secretAccessKey: 'test-secret',
        region: 'us-west-1',
      });

      expect(client).toBeInstanceOf(FastlyStorageClient);
    });

    it('should throw error when config is invalid', () => {
      expect(() => {
        new FastlyStorageClient({
          endpoint: '',
          accessKeyId: '',
          secretAccessKey: '',
        });
      }).toThrow(FastlyStorageError);
    });
  });

  describe('destroy', () => {
    it('should destroy client', () => {
      const client = new FastlyStorageClient({
        endpoint: 'https://example.com',
        accessKeyId: 'test-key',
        secretAccessKey: 'test-secret',
      });

      expect(() => client.destroy()).not.toThrow();
    });
  });
});
