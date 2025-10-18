export class Logger {
  private static verboseEnabled = false;

  static setVerbose(enabled: boolean): void {
    Logger.verboseEnabled = enabled;
  }

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

  static verbose(message: string, data?: any): void {
    if (Logger.verboseEnabled) {
      console.log(`[VERBOSE] ${message}`);
      if (data !== undefined) {
        if (typeof data === 'string') {
          console.log(data);
        } else {
          console.log(JSON.stringify(data, null, 2));
        }
      }
    }
  }

  static verboseRequest(endpoint: string, method: string, payload?: any): void {
    if (Logger.verboseEnabled) {
      console.log(`\n${'='.repeat(80)}`);
      console.log(`[VERBOSE] API REQUEST: ${method} ${endpoint}`);
      console.log('='.repeat(80));
      if (payload) {
        console.log(JSON.stringify(payload, null, 2));
      }
      console.log('='.repeat(80) + '\n');
    }
  }

  static verboseResponse(endpoint: string, status: number | string, response?: any): void {
    if (Logger.verboseEnabled) {
      console.log(`\n${'='.repeat(80)}`);
      console.log(`[VERBOSE] API RESPONSE: ${endpoint} (Status: ${status})`);
      console.log('='.repeat(80));
      if (response) {
        if (typeof response === 'string') {
          console.log(response);
        } else {
          console.log(JSON.stringify(response, null, 2));
        }
      }
      console.log('='.repeat(80) + '\n');
    }
  }
}
