import React from 'react';
import DiceGame from './components/DiceGame';
import Wallet from './components/Wallet';

function App() {
  return (
    <div className="min-h-screen bg-gray-900">
      <Wallet />
      <DiceGame />
    </div>
  );
}

export default App;