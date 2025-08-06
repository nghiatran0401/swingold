import { useState, useEffect } from "react";
import { ethers } from "ethers";
import SwingoldABI from "../shared-abis/SwingoldABI.json";
import TradeManagerABI from "../shared-abis/TradeManagerABI.json";

export const useWallet = () => {
  const [account, setAccount] = useState(null);
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [chainId, setChainId] = useState(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState(null);
  const [tokenBalance, setTokenBalance] = useState(null);
  const [isLoadingBalance, setIsLoadingBalance] = useState(false);

  // Check if user manually disconnected (persisted in localStorage)
  const isManuallyDisconnected = () => {
    return localStorage.getItem("swingold_manually_disconnected") === "true";
  };

  // Contract addresses from environment
  const SWINGOLD_ADDRESS = process.env.REACT_APP_SWINGOLD_ADDRESS;
  const TRADE_MANAGER_ADDRESS = process.env.REACT_APP_TRADE_MANAGER_ADDRESS;

  // Check if MetaMask is installed
  const isMetaMaskInstalled = () => {
    return typeof window !== "undefined" && window.ethereum && window.ethereum.isMetaMask;
  };

  // Initialize provider
  const initializeProvider = () => {
    if (!isMetaMaskInstalled()) {
      throw new Error("MetaMask is not installed. Please install MetaMask to use this dApp.");
    }

    const newProvider = new ethers.BrowserProvider(window.ethereum);
    setProvider(newProvider);
    return newProvider;
  };

  // Handle account changes
  const handleAccountsChanged = async (accounts) => {
    // Don't auto-connect if user manually disconnected
    if (isManuallyDisconnected()) return;

    if (accounts.length === 0) {
      // MetaMask is locked or the user has no accounts
      setAccount(null);
      setSigner(null);
      setTokenBalance(null);
    } else if (accounts[0] !== account) {
      setAccount(accounts[0]);
      if (provider) {
        const newSigner = await provider.getSigner();
        setSigner(newSigner);
      }
    }
  };

  // Handle chain changes
  const handleChainChanged = () => {
    // Reload the page when chain changes
    window.location.reload();
  };

  // Handle disconnect
  const handleDisconnect = () => {
    setAccount(null);
    setSigner(null);
    setTokenBalance(null);
    setChainId(null);
  };

  // Setup event listeners - only run once on mount
  useEffect(() => {
    if (!isMetaMaskInstalled()) return;

    // Initialize provider
    try {
      const newProvider = initializeProvider();

      // Set up event listeners
      window.ethereum.on("accountsChanged", handleAccountsChanged);
      window.ethereum.on("chainChanged", handleChainChanged);
      window.ethereum.on("disconnect", handleDisconnect);

      // Check if already connected - but only if not manually disconnected
      const checkConnection = async () => {
        if (isManuallyDisconnected()) return;

        try {
          const accounts = await window.ethereum.request({ method: "eth_accounts" });
          if (accounts.length > 0) {
            await handleAccountsChanged(accounts);
            const network = await newProvider.getNetwork();
            setChainId(network.chainId.toString());
          }
        } catch (err) {
          console.error("Error checking connection:", err);
        }
      };

      checkConnection();
    } catch (err) {
      setError(err.message);
    }

    // Cleanup event listeners
    return () => {
      if (window.ethereum) {
        window.ethereum.removeListener("accountsChanged", handleAccountsChanged);
        window.ethereum.removeListener("chainChanged", handleChainChanged);
        window.ethereum.removeListener("disconnect", handleDisconnect);
      }
    };
  }, []); // Empty dependency array - only run once

  // Load token balance when account changes
  useEffect(() => {
    if (account && SWINGOLD_ADDRESS && provider) {
      loadTokenBalance();
    }
  }, [account, SWINGOLD_ADDRESS, provider]);

  // Connect wallet
  const connect = async () => {
    if (!isMetaMaskInstalled()) {
      throw new Error("MetaMask is not installed. Please install MetaMask to use this dApp.");
    }

    setIsConnecting(true);
    setError(null);

    // Clear manual disconnect flag when user actively connects
    localStorage.removeItem("swingold_manually_disconnected");

    try {
      // Request account access
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });

      if (!accounts || accounts.length === 0) {
        throw new Error("No accounts found. Please connect your MetaMask wallet.");
      }

      // Initialize provider if not already done
      const newProvider = provider || initializeProvider();

      // Get signer
      const newSigner = await newProvider.getSigner();
      const signerAddress = await newSigner.getAddress();

      // Verify the signer address matches the selected address
      if (signerAddress.toLowerCase() !== accounts[0].toLowerCase()) {
        throw new Error("Address mismatch. Please try connecting again.");
      }

      // Get network information
      const network = await newProvider.getNetwork();

      // Update state
      setAccount(accounts[0]);
      setSigner(newSigner);
      setChainId(network.chainId.toString());

      return {
        address: accounts[0],
        chainId: network.chainId.toString(),
        connected: true,
        connectedAt: new Date().toISOString(),
      };
    } catch (err) {
      const errorMessage = err.code === 4001 ? "Connection rejected by user." : err.message || "Failed to connect wallet.";
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsConnecting(false);
    }
  };

  // Disconnect wallet
  const disconnect = async () => {
    try {
      // Set manual disconnect flag in localStorage to persist across page refreshes
      localStorage.setItem("swingold_manually_disconnected", "true");

      // Try to properly disconnect from MetaMask
      if (window.ethereum) {
        try {
          // Method 1: Try to disconnect using wallet_disconnect (if supported)
          await window.ethereum.request({
            method: "wallet_disconnect",
          });
        } catch (e) {
          // Method 2: Try to revoke permissions
          try {
            await window.ethereum.request({
              method: "wallet_revokePermissions",
              params: [{ eth_accounts: {} }],
            });
          } catch (e2) {
            // Method 3: Just clear local state if MetaMask methods fail
            console.log("MetaMask disconnect methods not supported, clearing local state only");
          }
        }
      }

      // Clear local state
      setAccount(null);
      setSigner(null);
      setTokenBalance(null);
      setChainId(null);
      setError(null);
    } catch (error) {
      console.log("Disconnect error:", error);
      // Even if disconnect fails, we've set the localStorage flag and cleared local state
    }
  };

  // Clear disconnect state (useful for debugging or manual reset)
  const clearDisconnectState = () => {
    localStorage.removeItem("swingold_manually_disconnected");
  };

  // Load token balance
  const loadTokenBalance = async () => {
    if (!account || !SWINGOLD_ADDRESS || !provider) return;

    setIsLoadingBalance(true);
    try {
      const tokenContract = new ethers.Contract(SWINGOLD_ADDRESS, SwingoldABI, provider);
      const balance = await tokenContract.balanceOf(account);
      setTokenBalance(balance);
    } catch (err) {
      console.error("Failed to load token balance:", err);
      setTokenBalance(null);
    } finally {
      setIsLoadingBalance(false);
    }
  };

  // Get token balance for any address
  const getTokenBalance = async (address = null) => {
    const targetAddress = address || account;
    if (!targetAddress || !SWINGOLD_ADDRESS || !provider) {
      throw new Error("No address, contract, or provider available");
    }

    const tokenContract = new ethers.Contract(SWINGOLD_ADDRESS, SwingoldABI, provider);
    return await tokenContract.balanceOf(targetAddress);
  };

  // Get token contract instance
  const getTokenContract = () => {
    if (!SWINGOLD_ADDRESS) throw new Error("Token contract address not configured");
    if (!signer) throw new Error("No signer available. Please connect your wallet.");
    return new ethers.Contract(SWINGOLD_ADDRESS, SwingoldABI, signer);
  };

  // Get trade manager contract instance
  const getTradeManagerContract = () => {
    if (!TRADE_MANAGER_ADDRESS) throw new Error("Trade manager contract address not configured");
    if (!signer) throw new Error("No signer available. Please connect your wallet.");
    return new ethers.Contract(TRADE_MANAGER_ADDRESS, TradeManagerABI, signer);
  };

  // Get ETH balance
  const getBalance = async () => {
    if (!provider || !account) throw new Error("No provider or address available");
    return await provider.getBalance(account);
  };

  // Sign message
  const signMessage = async (message) => {
    if (!signer) throw new Error("No signer available. Please connect your wallet.");
    return await signer.signMessage(message);
  };

  // Token operations
  const approveTokens = async (spenderAddress, amount) => {
    const tokenContract = getTokenContract();
    const tx = await tokenContract.approve(spenderAddress, amount);
    return await tx.wait();
  };

  const transferTokens = async (toAddress, amount) => {
    const tokenContract = getTokenContract();
    const tx = await tokenContract.transfer(toAddress, amount);
    return await tx.wait();
  };

  // Trade operations
  const createTrade = async (sellerAddress, itemName, itemCategory, price) => {
    const tradeContract = getTradeManagerContract();
    const tx = await tradeContract.createTrade(sellerAddress, itemName, itemCategory, price);
    return await tx.wait();
  };

  const confirmTrade = async (itemName) => {
    const tradeContract = getTradeManagerContract();
    const tx = await tradeContract.confirmTrade(itemName);
    return await tx.wait();
  };

  const cancelTrade = async (itemName) => {
    const tradeContract = getTradeManagerContract();
    const tx = await tradeContract.cancelTrade(itemName);
    return await tx.wait();
  };

  const getTradeInfo = async (itemName) => {
    if (!provider) throw new Error("No provider available");
    if (!TRADE_MANAGER_ADDRESS) throw new Error("Trade manager contract address not configured");

    const tradeContract = new ethers.Contract(TRADE_MANAGER_ADDRESS, TradeManagerABI, provider);
    const tradeInfo = await tradeContract.trades(itemName);

    return {
      buyer: tradeInfo[0],
      seller: tradeInfo[1],
      itemName: tradeInfo[2],
      itemCategory: tradeInfo[3],
      itemPrice: tradeInfo[4],
      createdAt: tradeInfo[5],
      confirmed: tradeInfo[6],
      completed: tradeInfo[7],
    };
  };

  // Utility functions
  const formatAddress = (address) => {
    if (!address) return "";
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const formatTokenBalance = (balance, decimals = 18) => {
    if (!balance) return "0";
    return ethers.formatUnits(balance, decimals);
  };

  const parseTokenAmount = (amount, decimals = 18) => {
    return ethers.parseUnits(amount.toString(), decimals);
  };

  const hasSufficientBalance = async (address, requiredAmount) => {
    try {
      const balance = await getTokenBalance(address);
      return balance >= requiredAmount;
    } catch (err) {
      console.error("Error checking balance:", err);
      return false;
    }
  };

  const getNetworkInfo = async () => {
    if (!provider) throw new Error("No provider available");
    const network = await provider.getNetwork();
    return {
      chainId: network.chainId.toString(),
      name: network.name,
    };
  };

  return {
    // State
    account,
    provider,
    signer,
    chainId,
    isConnected: !!account,
    isConnecting,
    error,
    tokenBalance,
    isLoadingBalance,

    // Connection methods
    connect,
    disconnect,

    // Utility methods
    getBalance,
    signMessage,
    getTokenBalance,
    loadTokenBalance,
    getTokenContract,
    getTradeManagerContract,

    // Token operations
    approveTokens,
    transferTokens,

    // Trade operations
    createTrade,
    confirmTrade,
    cancelTrade,
    getTradeInfo,

    // Utility functions
    formatAddress,
    formatTokenBalance,
    parseTokenAmount,
    hasSufficientBalance,
    getNetworkInfo,

    // Aliases for backward compatibility
    address: account,
    walletInfo: account
      ? {
          address: account,
          chainId,
          connected: true,
          connectedAt: new Date().toISOString(),
        }
      : null,
  };
};
