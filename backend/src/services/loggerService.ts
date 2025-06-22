export class LoggerService {
  private isDevelopment = process.env.NODE_ENV === 'development';

  error(message: string, error?: any): void {
    if (this.isDevelopment) {
      console.error(`[ERROR] ${new Date().toISOString()} - ${message}`, error);
    }
    // In production, errors are handled silently
    // You could integrate with services like Sentry, LogRocket, etc.
  }

  warn(message: string, data?: any): void {
    if (this.isDevelopment) {
      console.warn(`[WARN] ${new Date().toISOString()} - ${message}`, data);
    }
  }

  info(message: string, data?: any): void {
    if (this.isDevelopment) {
      console.log(`[INFO] ${new Date().toISOString()} - ${message}`, data);
    }
  }
}

export const logger = new LoggerService();