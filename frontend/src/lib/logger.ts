/**
 * Logger Utility
 * 
 * Provides logging functions that respect the development environment.
 * In production, only errors and warnings are logged to avoid console pollution.
 */

const isDevelopment = import.meta.env.DEV;

export const logger = {
  /**
   * Log general information (only in development)
   */
  log: (...args: any[]): void => {
    if (isDevelopment) {
      console.log(...args);
    }
  },

  /**
   * Log informational messages (only in development)
   */
  info: (...args: any[]): void => {
    if (isDevelopment) {
      console.info(...args);
    }
  },

  /**
   * Log warnings (in all environments)
   */
  warn: (...args: any[]): void => {
    console.warn(...args);
  },

  /**
   * Log errors (in all environments)
   */
  error: (...args: any[]): void => {
    console.error(...args);
  },

  /**
   * Log debug information (only in development)
   */
  debug: (...args: any[]): void => {
    if (isDevelopment) {
      console.debug(...args);
    }
  },
} as const;

// Export type for consistency
export type Logger = typeof logger;
