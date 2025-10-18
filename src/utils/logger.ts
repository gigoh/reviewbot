export class Logger {
  static info(message: string, ...args: any[]): void {
    console.log(`[INFO] ${message}`, ...args);
  }

  static success(message: string, ...args: any[]): void {
    console.log(`[SUCCESS] ${message}`, ...args);
  }

  static warn(message: string, ...args: any[]): void {
    console.warn(`[WARN] ${message}`, ...args);
  }

  static error(message: string, error?: any): void {
    console.error(`[ERROR] ${message}`);
    if (error) {
      console.error(error);
    }
  }

  static debug(message: string, ...args: any[]): void {
    if (process.env.DEBUG) {
      console.log(`[DEBUG] ${message}`, ...args);
    }
  }
}
