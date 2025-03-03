import React, { useState, useEffect } from 'react';
import { web3Service } from '../web3';

const Wallet: React.FC = () => {
    const [address, setAddress] = useState<string>('');
    const [balance, setBalance] = useState<string>('');
    const [ethPrice, setEthPrice] = useState<number>(0);
    const [isConnected, setIsConnected] = useState<boolean>(false);

    const fetchEthPrice = async () => {
        try {
            const response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd');
            const data = await response.json();
            setEthPrice(data.ethereum.usd);
        } catch (error) {
            console.error('Failed to fetch ETH price:', error);
        }
    };

    const updateBalance = async (walletAddress: string) => {
        try {
            const walletBalance = await web3Service.getBalance(walletAddress);
            setBalance(walletBalance);
        } catch (error) {
            console.error('Failed to update balance:', error);
        }
    };

    const connectWallet = async () => {
        try {
            const walletAddress = await web3Service.connectWallet();
            setAddress(walletAddress);
            setIsConnected(true);
            await updateBalance(walletAddress);
        } catch (error) {
            console.error('Failed to connect wallet:', error);
        }
    };

    const disconnectWallet = async () => {
        try {
            await web3Service.disconnect();
            setAddress('');
            setBalance('');
            setIsConnected(false);
        } catch (error) {
            console.error('Failed to disconnect wallet:', error);
        }
    };

    // Listen for dice roll events
    useEffect(() => {
        const handleDiceRoll = () => {
            if (isConnected && address) {
                updateBalance(address);
            }
        };

        window.addEventListener('diceRoll', handleDiceRoll);
        return () => {
            window.removeEventListener('diceRoll', handleDiceRoll);
        };
    }, [isConnected, address]);

    // Update balance and ETH price every 5 seconds when connected
    useEffect(() => {
        let intervalId: NodeJS.Timeout;

        if (isConnected && address) {
            updateBalance(address);
            fetchEthPrice();
            intervalId = setInterval(() => {
                updateBalance(address);
                fetchEthPrice();
            }, 5000); // Update every 5 seconds
        }

        return () => {
            if (intervalId) {
                clearInterval(intervalId);
            }
        };
    }, [isConnected, address]);

    // Calculate USD value
    const calculateUsdValue = (ethBalance: string): string => {
        if (!ethBalance || !ethPrice) return '0.00';
        const ethAmount = parseFloat(ethBalance);
        return (ethAmount * ethPrice).toFixed(2);
    };

    return (
        <div className="fixed top-4 right-4 bg-gray-800 p-4 rounded-lg shadow-lg">
            {!isConnected ? (
                <button
                    onClick={connectWallet}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition-colors"
                >
                    Connect Wallet
                </button>
            ) : (
                <div className="space-y-2">
                    <div className="text-white">
                        <span className="text-gray-400">Address: </span>
                        <span className="font-mono">{address.slice(0, 6)}...{address.slice(-4)}</span>
                    </div>
                    <div className="text-white">
                        <span className="text-gray-400">Balance: </span>
                        <span>{balance ? parseFloat(balance).toFixed(4) : '0.0000'} ETH</span>
                    </div>
                    <div className="text-white">
                        <span className="text-gray-400">Value: </span>
                        <span>${calculateUsdValue(balance)} USD</span>
                    </div>
                    <div className="text-sm text-gray-400">
                        ETH Price: ${ethPrice.toFixed(2)}
                    </div>
                    <button
                        onClick={disconnectWallet}
                        className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded transition-colors w-full"
                    >
                        Disconnect
                    </button>
                </div>
            )}
        </div>
    );
};

export default Wallet; 