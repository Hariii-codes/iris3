import crypto from 'crypto';

// Convert raw iris data to a secure hash
export const hashIris = (irisData) => {
  return crypto.createHash('sha256').update(irisData).digest('hex');
};

// Compare raw iris data with stored hash
export const compareIris = (irisData, storedHash) => {
  const hash = hashIris(irisData);
  return hash === storedHash;
};
