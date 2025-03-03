import { ethers } from 'ethers';

// Declare window.ethereum type
declare global {
    interface Window {
        ethereum?: any;
    }
}

// Contract ABI and address should be imported from your contract configuration
// import { CONTRACT_ABI, CONTRACT_ADDRESS } from './contracts/config';

export class Web3Service {
    private provider: ethers.BrowserProvider | null = null;
    private signer: ethers.JsonRpcSigner | null = null;
    private contract: ethers.Contract | null = null;

    constructor() {
        // Initialize provider if window.ethereum is available
        if (typeof window !== 'undefined' && window.ethereum) {
            this.provider = new ethers.BrowserProvider(window.ethereum);
        }
    }

    async connectWallet(): Promise<string> {
        try {
            if (!this.provider) {
                throw new Error('No Web3 provider found. Please install MetaMask or another Web3 wallet.');
            }

            // Request account access
            const accounts = await this.provider.send('eth_requestAccounts', []);
            this.signer = await this.provider.getSigner();
            
            return accounts[0];
        } catch (error) {
            console.error('Error connecting wallet:', error);
            throw error;
        }
    }

    async getBalance(address: string): Promise<string> {
        try {
            if (!this.provider) {
                throw new Error('Provider not initialized');
            }

            const balance = await this.provider.getBalance(address);
            return ethers.formatEther(balance);
        } catch (error) {
            console.error('Error getting balance:', error);
            throw error;
        }
    }

    async initializeContract(contractAddress: string, contractABI: any): Promise<void> {
        try {
            if (!this.signer) {
                throw new Error('Signer not initialized');
            }

            this.contract = new ethers.Contract(
                contractAddress,
                contractABI,
                this.signer
            );
        } catch (error) {
            console.error('Error initializing contract:', error);
            throw error;
        }
    }

    // Example contract interaction method
    async rollDice(betAmount: string): Promise<any> {
        try {
            if (!this.contract) {
                throw new Error('Contract not initialized');
            }

            const tx = await this.contract.rollDice({
                value: ethers.parseEther(betAmount)
            });
            return await tx.wait();
        } catch (error) {
            console.error('Error rolling dice:', error);
            throw error;
        }
    }

    async disconnect(): Promise<void> {
        this.signer = null;
        this.contract = null;
    }
}

// Create a singleton instance
export const web3Service = new Web3Service(); 