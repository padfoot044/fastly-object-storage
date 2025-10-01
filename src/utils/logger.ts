import type { Logger } from '../types';

/**
 * Default logger implementation
 */
export class DefaultLogger implements Logger {
  debug(message: string, meta?: unknown): void {
    if (process.env.DEBUG) {
      console.log(`[DEBUG] ${message}`, meta ? JSON.stringify(meta) : '');
    }
  }

  info(message: string, meta?: unknown): void {
    if (process.env.DEBUG) {
      console.log(`[INFO] ${message}`, meta ? JSON.stringify(meta) : '');
    }
  }

  warn(message: string, meta?: unknown): void {
    console.warn(`[WARN] ${message}`, meta ? JSON.stringify(meta) : '');
  }

  error(message: string, meta?: unknown): void {
    console.error(`[ERROR] ${message}`, meta ? JSON.stringify(meta) : '');
  }
}
