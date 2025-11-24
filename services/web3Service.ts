import { Pet, SpeciesType, LifeStage } from '../types';
import { MINT_COSTS } from '../constants';
import { ethers } from 'ethers';

// For demo purposes, we send the "fee" to a burn address or a specific treasury address
// In a real dApp, this would be a contract function call.
const TREASURY_ADDRESS = "0x000000000000000000000000000000000000dEaD"; 

declare global {
  interface Window {
    ethereum?: any;
    $onekey?: any;
  }
}

export type WalletProviderType = 'injected' | 'coinbase' | 'walletconnect';

// Helper to prioritize OneKey wallet if installed
const getProviderSource = () => {
    if (window.$onekey && window.$onekey.ethereum) {
        return window.$onekey.ethereum;
    }
    return window.ethereum;
};

export const connectWallet = async (type: WalletProviderType = 'injected'): Promise<{ address: string; balance: string }> => {
  const providerSource = getProviderSource();

  if (!providerSource) {
    throw new Error("No crypto wallet found. Please install OneKey or MetaMask.");
  }

  let provider;
  
  // In a full production app, you would use specific logic for Coinbase/WalletConnect SDKs here.
  // For this browser-based demo, we primarily rely on the injected provider (window.ethereum)
  // which MetaMask, Coinbase Wallet, and others inject.
  provider = new ethers.BrowserProvider(providerSource);

  // Request account access
  const accounts = await provider.send("eth_requestAccounts", []);
  if (!accounts || accounts.length === 0) {
    throw new Error("User denied account access");
  }

  const signer = await provider.getSigner();
  const address = await signer.getAddress();
  const balanceBigInt = await provider.getBalance(address);
  const balance = ethers.formatEther(balanceBigInt);

  return { address, balance };
};

export const mintPet = async (
  walletAddress: string, 
  species: SpeciesType | null, 
  currentCount: number
): Promise<Pet> => {
  const providerSource = getProviderSource();
  if (!providerSource) throw new Error("Wallet disconnected");

  const cost = currentCount === 0 ? MINT_COSTS.FIRST : MINT_COSTS.SUBSEQUENT;
  
  const provider = new ethers.BrowserProvider(providerSource);
  const signer = await provider.getSigner();

  // 1. Create Transaction
  const txParams = {
    to: TREASURY_ADDRESS,
    value: ethers.parseEther(cost.toString())
  };

  try {
    // 2. Send Transaction (Prompts user wallet)
    console.log("Initiating transaction...");
    const txResponse = await signer.sendTransaction(txParams);
    
    console.log("Transaction sent:", txResponse.hash);
    
    // 3. Wait for confirmation (On-chain)
    const receipt = await txResponse.wait(1); // Wait for 1 block confirmation
    
    if (!receipt || receipt.status === 0) {
        throw new Error("Transaction failed on-chain");
    }

    console.log("Transaction confirmed!", receipt);

    // 4. Generate Pet Data (In a real app, this data comes from the contract event logs)
    const selectedSpecies = species || Object.values(SpeciesType)[Math.floor(Math.random() * 4)];
    
    return {
      id: `pet-${Date.now()}`, // Real contract would provide TokenID
      speciesId: selectedSpecies,
      name: `${selectedSpecies} #${currentCount + 1}`,
      stage: LifeStage.INFANT,
      stats: { hunger: 0, intimacy: 0, health: 0 },
      birthDate: Date.now(),
      generation: 1
    };

  } catch (error: any) {
    console.error("Minting Error:", error);
    if (error.code === 4001 || error.code === 'ACTION_REJECTED') {
        throw new Error("Transaction rejected by user.");
    }
    throw new Error("Failed to mint on blockchain.");
  }
};

export const updatePetOnChain = async (pet: Pet): Promise<boolean> => {
  // In a real dApp, this would be a contract call like `contract.evolve(tokenId)`
  // For this demo, we simulate the delay of a write operation
  return new Promise(resolve => setTimeout(() => resolve(true), 2000));
};