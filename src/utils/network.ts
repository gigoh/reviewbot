import { networkInterfaces } from 'os';

/**
 * Get the local IP address of the machine
 * Returns the first non-internal IPv4 address found
 */
export function getLocalIpAddress(): string {
  const nets = networkInterfaces();

  for (const name of Object.keys(nets)) {
    const interfaces = nets[name];
    if (!interfaces) continue;

    for (const net of interfaces) {
      // Skip internal (i.e. 127.0.0.1) and non-IPv4 addresses
      const familyV4Value = typeof net.family === 'string' ? 'IPv4' : 4;
      if (net.family === familyV4Value && !net.internal) {
        return net.address;
      }
    }
  }

  // Fallback to localhost if no external IP found
  return '127.0.0.1';
}

/**
 * Get a formatted string with IP address and timestamp
 */
export function getReviewMetadata(): string {
  const ipAddress = getLocalIpAddress();
  const timestamp = new Date().toISOString();

  return `Review generated from IP: ${ipAddress} at ${timestamp}`;
}
