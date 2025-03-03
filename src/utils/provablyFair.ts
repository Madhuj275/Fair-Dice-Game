import SHA256 from 'crypto-js/sha256';
import Hex from 'crypto-js/enc-hex';


export const generateServerSeed = (): string => {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < 64; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
};

export const generateClientSeed = (): string => {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < 32; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
};

export const hashServerSeed = (serverSeed: string): string => {
  return SHA256(serverSeed).toString(Hex);
};

export const generateRoll = (serverSeed: string, clientSeed: string, nonce: number): number => {
  const combinedSeed = `${serverSeed}-${clientSeed}-${nonce}`;
  
  const hash = SHA256(combinedSeed).toString(Hex);
  

  const hexResult = hash.substring(0, 8);
  

  const decimalResult = parseInt(hexResult, 16);
  

  return (decimalResult % 6) + 1;
};


export const verifyRoll = (
  serverSeed: string, 
  clientSeed: string, 
  nonce: number, 
  hashedServerSeed: string
): boolean => {
  
  const calculatedHash = hashServerSeed(serverSeed);
  if (calculatedHash !== hashedServerSeed) {
    return false;
  }
  
  const roll = generateRoll(serverSeed, clientSeed, nonce);
  
  return roll >= 1 && roll <= 6;
};