export async function hashIrisData(irisPattern: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(irisPattern);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  return hashHex;
}

export async function hashPin(pin: string): Promise<string> {
  return hashIrisData(pin);
}

export function generateTransactionId(): string {
  const date = new Date().toISOString().split('T')[0].replace(/-/g, '');
  const random = Math.floor(Math.random() * 999999).toString().padStart(6, '0');
  return `TXN${date}-${random}`;
}

export function simulateIrisScan(): Promise<string> {
  return new Promise((resolve) => {
    setTimeout(() => {
      const patterns = [
        'iris_pattern_123',
        'iris_pattern_456',
        'iris_pattern_789'
      ];
      const randomPattern = patterns[Math.floor(Math.random() * patterns.length)];
      resolve(randomPattern);
    }, 2000);
  });
}
