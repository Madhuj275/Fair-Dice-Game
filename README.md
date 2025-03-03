# Provably Fair Dice Game

A modern, provably fair dice game built with React and TypeScript. This game implements a provably fair algorithm to ensure transparent and verifiable results.

## Features

- 🎲 Provably fair dice rolling system
- 💰 Real-time balance tracking
- 🎯 Win/lose probability display
- 📊 Roll history tracking
- 💼 Ethereum wallet integration
- 🎨 Modern UI with Tailwind CSS
- 🔒 Secure and verifiable results

## How It Works

### Provably Fair System

1. Before each bet, the server generates a random server seed and hashes it
2. The hashed server seed is shown to the player before betting
3. The player's client seed and a nonce are combined with the server seed
4. After the roll, the original server seed is revealed for verification
5. The result is determined by a fair algorithm that can be verified

### Game Rules

- Roll a number greater than or equal to 4 to win
- Win chance: 50%
- Multiplier: 2x
- Minimum roll to win: 3.50

## Technical Stack

- React 18
- TypeScript
- Tailwind CSS
- Ethers.js for Ethereum integration
- Vite for build tooling

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- MetaMask or another Web3 wallet

### Installation

1. Clone the repository:
```bash
git clone https://github.com/Madhuj275/provably-fair-dice-game.git
cd provably-fair-dice-game
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser and navigate to `http://localhost:5173`

## Usage

1. Connect your Ethereum wallet using the "Connect Wallet" button
2. Set your bet amount using the input field or quick buttons (½, 2×, Max)
3. Click "Roll Dice" to play
4. View your roll history and verify results using the provably fair system

## Verifying Results

Each roll can be verified using the following information:
- Server Seed
- Client Seed
- Nonce
- Hashed Server Seed

The game uses SHA256 hashing to ensure the integrity of results.

