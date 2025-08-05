import { useState, useEffect } from "react";
import { ethers } from "ethers";

export const useWallet = () => {
  const [walletInfo, setWalletInfo] = useState(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState(null);

  // Load wallet info from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem("walletInfo");
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setWalletInfo(parsed);
      } catch (err) {
        console.error("Failed to parse stored wallet info:", err);
        localStorage.removeItem("walletInfo");
      }
    }
  }, []);

  const connect = async () => {
    if (!window.ethereum) {
      throw new Error("MetaMask not detected. Please install MetaMask!");
    }

    setIsConnecting(true);
    setError(null);

    try {
      // Request account access
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });

      if (!accounts || accounts.length === 0) {
        throw new Error("No accounts found");
      }

      const selectedAddress = accounts[0];

      // Get provider and signer
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();

      // Verify the signer address matches the selected address
      const signerAddress = await signer.getAddress();
      if (signerAddress.toLowerCase() !== selectedAddress.toLowerCase()) {
        throw new Error("Address mismatch");
      }

      // Get network information
      const network = await provider.getNetwork();

      // Store wallet information
      const newWalletInfo = {
        address: selectedAddress,
        chainId: network.chainId.toString(),
        connected: true,
        connectedAt: new Date().toISOString(),
      };

      localStorage.setItem("walletInfo", JSON.stringify(newWalletInfo));
      setWalletInfo(newWalletInfo);

      return newWalletInfo;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setIsConnecting(false);
    }
  };

  const disconnect = () => {
    localStorage.removeItem("walletInfo");
    setWalletInfo(null);
    setError(null);
  };

  const getProvider = () => {
    if (!window.ethereum) return null;
    return new ethers.BrowserProvider(window.ethereum);
  };

  const getSigner = async () => {
    const provider = getProvider();
    if (!provider) throw new Error("No provider available");
    return await provider.getSigner();
  };

  const signMessage = async (message) => {
    const signer = await getSigner();
    return await signer.signMessage(message);
  };

  const getBalance = async () => {
    const provider = getProvider();
    if (!provider || !walletInfo?.address) throw new Error("No provider or address available");
    return await provider.getBalance(walletInfo.address);
  };

  const formatAddress = (address) => {
    if (!address) return "";
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  return {
    walletInfo,
    isConnected: !!walletInfo?.connected,
    isConnecting,
    error,
    connect,
    disconnect,
    getProvider,
    getSigner,
    signMessage,
    getBalance,
    formatAddress,
    address: walletInfo?.address,
  };
};
