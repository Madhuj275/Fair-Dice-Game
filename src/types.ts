export interface GameState {
  balance: number;
  betAmount: number;
  isRolling: boolean;
  lastRoll: number | null;
  lastResult: 'win' | 'lose' | null;
  serverSeed: string;
  clientSeed: string;
  nonce: number;
  previousRolls: RollHistory[];
}

export interface RollHistory {
  roll: number;
  betAmount: number;
  result: 'win' | 'lose';
  serverSeed: string;
  clientSeed: string;
  nonce: number;
  hashedServerSeed: string;
}