import type { Logger } from '../types';

/**
 * Default logger implementation
 */
export class DefaultLogger implements Logger {
  debug(message: string, meta?: unknown): void {
    if (process.env.DEBUG) {
      // eslint-disable-next-line no-console
      console.log(`[DEBUG] ${message}`, meta ? JSON.stringify(meta) : '');
    }
  }

  info(message: string, meta?: unknown): void {
    if (process.env.DEBUG) {
      // eslint-disable-next-line no-console
      console.log(`[INFO] ${message}`, meta ? JSON.stringify(meta) : '');
    }
  }

  warn(message: string, meta?: unknown): void {
    // eslint-disable-next-line no-console
    console.warn(`[WARN] ${message}`, meta ? JSON.stringify(meta) : '');
  }

  error(message: string, meta?: unknown): void {
    // eslint-disable-next-line no-console
    console.error(`[ERROR] ${message}`, meta ? JSON.stringify(meta) : '');
  }
}
