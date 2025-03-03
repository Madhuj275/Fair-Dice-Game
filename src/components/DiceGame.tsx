import React, { useState, useEffect } from 'react';
import { Dice1, Dice2, Dice3, Dice4, Dice5, Dice6, RefreshCw, Info, History } from 'lucide-react';
import { GameState, RollHistory } from '../types';
import { generateServerSeed, generateClientSeed, hashServerSeed, generateRoll } from '../utils/provablyFair';

const INITIAL_BALANCE = 1000;

const DiceGame: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>(() => {
    const savedState = localStorage.getItem('diceGameState');
    if (savedState) {
      return JSON.parse(savedState);
    }
    
    const serverSeed = generateServerSeed();
    const clientSeed = generateClientSeed();
    
    return {
      balance: INITIAL_BALANCE,
      betAmount: 10,
      isRolling: false,
      lastRoll: null,
      lastResult: null,
      serverSeed,
      clientSeed,
      nonce: 0,
      previousRolls: []
    };
  });
  
  const [showHistory, setShowHistory] = useState(false);
  const [showInfo, setShowInfo] = useState(false);
  
  useEffect(() => {
    localStorage.setItem('diceGameState', JSON.stringify(gameState));
  }, [gameState]);
  
  const handleBetAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value);
    if (!isNaN(value) && value >= 0) {
      setGameState(prev => ({ ...prev, betAmount: value }));
    }
  };
  
  const handleHalfBet = () => {
    setGameState(prev => ({ ...prev, betAmount: Math.max(prev.betAmount / 2, 1) }));
  };
  
  const handleDoubleBet = () => {
    setGameState(prev => ({ ...prev, betAmount: Math.min(prev.betAmount * 2, prev.balance) }));
  };
  
  const handleMaxBet = () => {
    setGameState(prev => ({ ...prev, betAmount: prev.balance }));
  };
  
  const rollDice = () => {
    if (gameState.isRolling || gameState.betAmount <= 0 || gameState.betAmount > gameState.balance) {
      return;
    }
    
    setGameState(prev => ({ ...prev, isRolling: true }));
    
    setTimeout(() => {
      const { serverSeed, clientSeed, nonce, betAmount, balance, previousRolls } = gameState;
    
      const roll = generateRoll(serverSeed, clientSeed, nonce);
      
      const isWin = roll >= 4;
      const result = isWin ? 'win' : 'lose';
      
      const newBalance = isWin 
        ? balance + betAmount 
        : balance - betAmount;
      
      
      const rollHistory: RollHistory = {
        roll,
        betAmount,
        result,
        serverSeed,
        clientSeed,
        nonce,
        hashedServerSeed: hashServerSeed(serverSeed)
      };
      
      const newServerSeed = generateServerSeed();
      
      setGameState(prev => ({
        ...prev,
        balance: newBalance,
        isRolling: false,
        lastRoll: roll,
        lastResult: result,
        serverSeed: newServerSeed,
        nonce: prev.nonce + 1,
        previousRolls: [rollHistory, ...prev.previousRolls].slice(0, 50) // Keep last 50 rolls
      }));
    }, 1000);
  };
  
  const resetGame = () => {
    const serverSeed = generateServerSeed();
    const clientSeed = generateClientSeed();
    
    setGameState({
      balance: INITIAL_BALANCE,
      betAmount: 10,
      isRolling: false,
      lastRoll: null,
      lastResult: null,
      serverSeed,
      clientSeed,
      nonce: 0,
      previousRolls: []
    });
  };
  
  const generateNewClientSeed = () => {
    const newClientSeed = generateClientSeed();
    setGameState(prev => ({ ...prev, clientSeed: newClientSeed }));
  };
  
  const renderDice = (roll: number | null) => {
    if (roll === null) return null;
    
    const diceProps = { size: 64, className: "text-white" };
    
    switch (roll) {
      case 1: return <Dice1 {...diceProps} />;
      case 2: return <Dice2 {...diceProps} />;
      case 3: return <Dice3 {...diceProps} />;
      case 4: return <Dice4 {...diceProps} />;
      case 5: return <Dice5 {...diceProps} />;
      case 6: return <Dice6 {...diceProps} />;
      default: return null;
    }
  };
  
  const winChance = 50; 
  
  const multiplier = 2; 
  
  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-4xl bg-gray-800 rounded-xl shadow-2xl overflow-hidden">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold">Provably Fair Dice Game</h1>
            <div className="flex gap-2">
              <button 
                onClick={() => setShowInfo(!showInfo)} 
                className="p-2 rounded-full bg-gray-700 hover:bg-gray-600 transition"
              >
                <Info size={20} />
              </button>
              <button 
                onClick={() => setShowHistory(!showHistory)} 
                className="p-2 rounded-full bg-gray-700 hover:bg-gray-600 transition"
              >
                <History size={20} />
              </button>
            </div>
          </div>
          
          {showInfo && (
            <div className="mb-6 p-4 bg-gray-700 rounded-lg">
              <h2 className="text-xl font-semibold mb-2">How Provably Fair Works</h2>
              <p className="mb-2">This game uses a provably fair algorithm to ensure fair results:</p>
              <ol className="list-decimal pl-5 space-y-1">
                <li>Before each bet, the server generates a random server seed and hashes it.</li>
                <li>You can see the hashed server seed before betting.</li>
                <li>Your client seed and a nonce are combined with the server seed to generate the roll.</li>
                <li>After the roll, the original server seed is revealed so you can verify the result.</li>
              </ol>
              <div className="mt-4">
                <p className="font-semibold">Current Client Seed:</p>
                <div className="flex items-center gap-2">
                  <input 
                    type="text" 
                    value={gameState.clientSeed} 
                    readOnly 
                    className="bg-gray-800 p-2 rounded flex-1 text-sm"
                  />
                  <button 
                    onClick={generateNewClientSeed}
                    className="p-2 bg-blue-600 hover:bg-blue-700 rounded"
                  >
                    <RefreshCw size={16} />
                  </button>
                </div>
              </div>
              <div className="mt-2">
                <p className="font-semibold">Current Hashed Server Seed:</p>
                <input 
                  type="text" 
                  value={hashServerSeed(gameState.serverSeed)} 
                  readOnly 
                  className="bg-gray-800 p-2 rounded w-full text-sm"
                />
              </div>
            </div>
          )}
          
          {showHistory && (
            <div className="mb-6 p-4 bg-gray-700 rounded-lg max-h-60 overflow-y-auto">
              <h2 className="text-xl font-semibold mb-2">Roll History</h2>
              {gameState.previousRolls.length === 0 ? (
                <p>No rolls yet. Start playing!</p>
              ) : (
                <div className="space-y-2">
                  {gameState.previousRolls.map((roll, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-gray-800 rounded">
                      <div className="flex items-center gap-2">
                        {renderDice(roll.roll)}
                        <div>
                          <p className={`font-bold ${roll.result === 'win' ? 'text-green-500' : 'text-red-500'}`}>
                            {roll.result === 'win' ? 'WIN' : 'LOSE'}
                          </p>
                          <p className="text-sm">Bet: ${roll.betAmount.toFixed(2)}</p>
                        </div>
                      </div>
                      <div className="text-xs text-gray-400">
                        <p>Nonce: {roll.nonce}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
          
          <div className="flex flex-col md:flex-row gap-6">
            <div className="flex-1 bg-gray-700 p-4 rounded-lg">
              <div className="mb-4">
                <div className="flex justify-between items-center">
                  <h2 className="text-lg font-semibold">Balance</h2>
                  <span className="text-xl font-bold">${gameState.balance.toFixed(2)}</span>
                </div>
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">Bet Amount</label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    value={gameState.betAmount}
                    onChange={handleBetAmountChange}
                    className="bg-gray-800 text-white p-2 rounded flex-1"
                    min="1"
                    max={gameState.balance}
                  />
                  <button 
                    onClick={handleHalfBet}
                    className="bg-gray-600 hover:bg-gray-500 px-3 py-2 rounded"
                  >
                    ½
                  </button>
                  <button 
                    onClick={handleDoubleBet}
                    className="bg-gray-600 hover:bg-gray-500 px-3 py-2 rounded"
                  >
                    2×
                  </button>
                  <button 
                    onClick={handleMaxBet}
                    className="bg-gray-600 hover:bg-gray-500 px-3 py-2 rounded"
                  >
                    Max
                  </button>
                </div>
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">Profit on Win</label>
                <input
                  type="text"
                  value={`$${(gameState.betAmount).toFixed(2)}`}
                  readOnly
                  className="bg-gray-800 text-white p-2 rounded w-full"
                />
              </div>
              
              <button
                onClick={rollDice}
                disabled={gameState.isRolling || gameState.betAmount <= 0 || gameState.betAmount > gameState.balance}
                className={`w-full py-3 rounded-lg text-lg font-bold ${
                  gameState.isRolling || gameState.betAmount <= 0 || gameState.betAmount > gameState.balance
                    ? 'bg-gray-600 cursor-not-allowed'
                    : 'bg-green-500 hover:bg-green-600'
                }`}
              >
                {gameState.isRolling ? 'Rolling...' : 'Roll Dice'}
              </button>
              
              <button
                onClick={resetGame}
                className="w-full mt-2 py-2 rounded-lg text-sm font-medium bg-red-600 hover:bg-red-700"
              >
                Reset Game
              </button>
            </div>
            
            <div className="flex-1 bg-gray-700 p-4 rounded-lg flex flex-col">
              <div className="flex-1 flex flex-col items-center justify-center">
                {gameState.lastRoll !== null ? (
                  <div className="text-center">
                    <div className="mb-4 flex justify-center">
                      {renderDice(gameState.lastRoll)}
                    </div>
                    <p className="text-2xl font-bold mb-2">
                      You rolled a {gameState.lastRoll}
                    </p>
                    <p className={`text-xl px-4 py-2 rounded-lg ${
                      gameState.lastResult === 'win' 
                        ? 'bg-green-500 text-black' 
                        : 'bg-red-500 text-white'
                    }`}>
                      {gameState.lastResult === 'win' 
                        ? `You won $${gameState.betAmount.toFixed(2)}!` 
                        : `You lost $${gameState.betAmount.toFixed(2)}`}
                    </p>
                  </div>
                ) : (
                  <p className="text-gray-400 text-center">Roll the dice to play!</p>
                )}
              </div>
              
              <div className="mt-6 pt-4 border-t border-gray-600">
                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-gray-800 p-3 rounded-lg">
                    <p className="text-sm text-gray-400">Multiplier</p>
                    <p className="text-xl font-bold">{multiplier.toFixed(4)}×</p>
                  </div>
                  <div className="bg-gray-800 p-3 rounded-lg">
                    <p className="text-sm text-gray-400">Roll Over</p>
                    <p className="text-xl font-bold">3.50</p>
                  </div>
                  <div className="bg-gray-800 p-3 rounded-lg">
                    <p className="text-sm text-gray-400">Win Chance</p>
                    <p className="text-xl font-bold">{winChance.toFixed(2)}%</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="bg-gray-900 p-6">
          <div className="relative">
            <div className="h-12 bg-gray-800 rounded-full overflow-hidden">
              <div className="h-full flex">
                <div className="w-1/2 bg-red-500"></div>
                <div className="w-1/2 bg-green-500"></div>
              </div>
            </div>
            
            <div className="absolute top-0 left-0 w-full h-full flex justify-between items-center px-4 text-sm">
              <span className="font-bold">1</span>
              <span className="font-bold">2</span>
              <span className="font-bold">3</span>
              <span>|</span>
              <span className="font-bold">4</span>
              <span className="font-bold">5</span>
              <span className="font-bold">6</span>
            </div>
            
            <div className="absolute top-0 left-1/2 transform -translate-x-1/2 h-full flex items-center">
              <div className="h-16 w-4 bg-blue-500 rounded"></div>
            </div>
            
            {gameState.lastRoll !== null && (
              <div 
                className="absolute top-0 h-full flex items-center"
                style={{ 
                  left: `${(gameState.lastRoll <= 3 ? 
                    ((gameState.lastRoll - 1) / 3) * 50 : 
                    50 + ((gameState.lastRoll - 3) / 3) * 50)}%`,
                  transition: 'left 0.5s ease-out'
                }}
              >
                <div className="h-12 w-12 bg-white rounded-lg flex items-center justify-center transform -translate-x-1/2">
                  <span className="text-black font-bold text-lg">{gameState.lastRoll}</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DiceGame;