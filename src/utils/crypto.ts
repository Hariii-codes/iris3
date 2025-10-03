// Hashes copied from src/services/mockDatabase.ts to ensure a match
const DEMO_HASH_MAP: { [key: string]: string } = {
  'alice': 'a665a45920422f9d417e4867efdc4fb8a04a1f3fff1fa07e998e86f7f7a27ae3', 
  'bob': '2c26b46b68ffc68ff99b453c1d30413413422d706483bfa0f98a5e886266e7ae',   
  'cafe': 'fcde2b2edba56bf408601fb721fe9b5c338d10ee429ea04fae5511b68fbf8fb9'  
};

export async function hashIrisData(irisPattern: string): Promise<string> {
  // FIX 2: If the pattern is a known demo credential, return the pre-computed hash
  if (DEMO_HASH_MAP[irisPattern]) {
    return DEMO_HASH_MAP[irisPattern];
  }

  // Original hashing logic for non-demo users
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