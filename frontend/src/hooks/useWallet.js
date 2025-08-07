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
    // Update chain ID when chain changes
    if (provider) {
      provider
        .getNetwork()
        .then((network) => {
          setChainId(network.chainId.toString());
        })
        .catch((err) => {
          console.error("Error getting network:", err);
        });
    }
  };

  // Handle disconnect
  const handleDisconnect = () => {
    setAccount(null);
    setSigner(null);
    setTokenBalance(null);
    setChainId(null);
  };

  // Clear local wallet state without deleting from database
  const clearLocalWalletState = () => {
    setAccount(null);
    setSigner(null);
    setTokenBalance(null);
    setChainId(null);
    setError(null);
    setIsConnecting(false);
    setIsLoadingBalance(false);
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

      // Check if already connected
      const checkConnection = async () => {
        try {
          const accounts = await window.ethereum.request({ method: "eth_accounts" });
          if (accounts.length > 0) {
            setAccount(accounts[0]);
            const newSigner = await newProvider.getSigner();
            setSigner(newSigner);

            // Wait a bit for provider to be fully initialized
            setTimeout(() => {
              loadTokenBalance(accounts[0]);
            }, 100);
          }

          // Get current chain ID
          const network = await newProvider.getNetwork();
          setChainId(network.chainId.toString());
        } catch (err) {
          console.error("Error checking connection:", err);
        }
      };

      checkConnection();
    } catch (err) {
      console.error("Error initializing provider:", err);
    }

    // Cleanup function
    return () => {
      if (window.ethereum) {
        window.ethereum.removeListener("accountsChanged", handleAccountsChanged);
        window.ethereum.removeListener("chainChanged", handleChainChanged);
      }
    };
  }, []);

  // Add effect to reload balance when provider changes
  useEffect(() => {
    if (provider && account && SWINGOLD_ADDRESS) {
      loadTokenBalance(account);
    }
  }, [provider, account, SWINGOLD_ADDRESS]);

  // Connect wallet
  const connect = async () => {
    if (!isMetaMaskInstalled()) {
      throw new Error("MetaMask is not installed. Please install MetaMask to use this dApp.");
    }

    setIsConnecting(true);
    setError(null);

    try {
      // Request account access
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });

      if (accounts.length === 0) {
        throw new Error("No accounts found. Please unlock MetaMask.");
      }

      const connectedAccount = accounts[0];

      // Initialize provider and signer
      const newProvider = initializeProvider();
      const newSigner = await newProvider.getSigner();

      // Set state
      setAccount(connectedAccount);
      setSigner(newSigner);

      // Get network info
      const network = await newProvider.getNetwork();
      setChainId(network.chainId.toString());

      // Load token balance
      await loadTokenBalance(connectedAccount);

      return true;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setIsConnecting(false);
    }
  };

  // Disconnect wallet
  const disconnect = async () => {
    try {
      // Clear local state
      clearLocalWalletState();

      // Note: MetaMask doesn't have a disconnect method
      // The wallet remains connected to the site until user manually disconnects
      return true;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  // Load token balance for an address
  const loadTokenBalance = async (address = null) => {
    const targetAddress = address || account;
    if (!targetAddress || !SWINGOLD_ADDRESS) return;

    setIsLoadingBalance(true);

    const attemptLoadBalance = async (retryCount = 0) => {
      try {
        // Wait a bit if provider is not ready
        if (!provider && typeof window !== "undefined" && window.ethereum) {
          await new Promise((resolve) => setTimeout(resolve, 200));
        }

        const balance = await getTokenBalance(targetAddress);
        if (balance !== null) {
          setTokenBalance(balance);
          return;
        }

        // Retry once if balance is null and we haven't retried yet
        if (balance === null && retryCount === 0) {
          console.log("Balance loading failed, retrying...");
          setTimeout(() => attemptLoadBalance(1), 500);
        }
      } catch (err) {
        console.error("Error loading token balance:", err);

        // Retry once if we haven't retried yet
        if (retryCount === 0) {
          console.log("Balance loading failed, retrying...");
          setTimeout(() => attemptLoadBalance(1), 500);
        } else {
          setTokenBalance(null);
        }
      }
    };

    await attemptLoadBalance();
    setIsLoadingBalance(false);
  };

  // Get token balance for an address
  const getTokenBalance = async (address = null) => {
    const targetAddress = address || account;
    if (!targetAddress || !SWINGOLD_ADDRESS) return null;

    try {
      const contract = getTokenContract();
      const balance = await contract.balanceOf(targetAddress);
      return balance.toString();
    } catch (err) {
      console.error("Error getting token balance:", err);
      return null;
    }
  };

  // Get token contract instance
  const getTokenContract = () => {
    if (!SWINGOLD_ADDRESS) return null;

    // If provider is not available, create a new one
    const currentProvider = provider || (typeof window !== "undefined" && window.ethereum ? new ethers.BrowserProvider(window.ethereum) : null);

    if (!currentProvider) return null;

    return new ethers.Contract(SWINGOLD_ADDRESS, SwingoldABI, currentProvider);
  };

  // Get trade manager contract instance
  const getTradeManagerContract = () => {
    if (!signer || !TRADE_MANAGER_ADDRESS) return null;
    return new ethers.Contract(TRADE_MANAGER_ADDRESS, TradeManagerABI, signer);
  };

  // Get ETH balance
  const getBalance = async () => {
    if (!account || !provider) return null;
    try {
      const balance = await provider.getBalance(account);
      return balance.toString();
    } catch (err) {
      console.error("Error getting ETH balance:", err);
      return null;
    }
  };

  // Sign a message
  const signMessage = async (message) => {
    if (!signer) throw new Error("No signer available");
    return await signer.signMessage(message);
  };

  // Approve tokens for spending
  const approveTokens = async (spenderAddress, amount) => {
    if (!signer || !SWINGOLD_ADDRESS) throw new Error("No signer or contract address available");
    const contract = new ethers.Contract(SWINGOLD_ADDRESS, SwingoldABI, signer);
    const tx = await contract.approve(spenderAddress, amount);
    return tx; // Return the transaction object, let the caller handle waiting
  };

  // Transfer tokens
  const transferTokens = async (toAddress, amount) => {
    if (!signer || !SWINGOLD_ADDRESS) throw new Error("No signer or contract address available");
    const contract = new ethers.Contract(SWINGOLD_ADDRESS, SwingoldABI, signer);
    const tx = await contract.transfer(toAddress, amount);
    return tx; // Return the transaction object, let the caller handle waiting
  };

  // Create a trade
  const createTrade = async (sellerAddress, itemName, itemCategory, price) => {
    if (!signer || !TRADE_MANAGER_ADDRESS) throw new Error("No signer or contract address available");
    const contract = new ethers.Contract(TRADE_MANAGER_ADDRESS, TradeManagerABI, signer);
    const tx = await contract.createTrade(sellerAddress, itemName, itemCategory, price);
    return tx; // Return the transaction object, let the caller handle waiting
  };

  // Confirm a trade
  const confirmTrade = async (itemName) => {
    if (!signer || !TRADE_MANAGER_ADDRESS) throw new Error("No signer or contract address available");
    const contract = new ethers.Contract(TRADE_MANAGER_ADDRESS, TradeManagerABI, signer);
    const tx = await contract.confirmTrade(itemName);
    return tx; // Return the transaction object, let the caller handle waiting
  };

  // Cancel a trade
  const cancelTrade = async (itemName) => {
    if (!signer || !TRADE_MANAGER_ADDRESS) throw new Error("No signer or contract address available");
    const contract = new ethers.Contract(TRADE_MANAGER_ADDRESS, TradeManagerABI, signer);
    const tx = await contract.cancelTrade(itemName);
    return tx; // Return the transaction object, let the caller handle waiting
  };

  // Get trade info
  const getTradeInfo = async (itemName) => {
    if (!provider || !TRADE_MANAGER_ADDRESS) throw new Error("No provider or contract address available");
    const contract = new ethers.Contract(TRADE_MANAGER_ADDRESS, TradeManagerABI, provider);
    const tradeInfo = await contract.getTradeInfo(itemName);
    return {
      seller: tradeInfo[0],
      buyer: tradeInfo[1],
      itemName: tradeInfo[2],
      itemCategory: tradeInfo[3],
      price: tradeInfo[4].toString(),
      status: tradeInfo[5],
    };
  };

  // Format address for display
  const formatAddress = (address) => {
    if (!address) return "";
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  // Format token balance
  const formatTokenBalance = (balance, decimals = 18) => {
    if (!balance) return "0";
    try {
      return ethers.formatUnits(balance, decimals);
    } catch (error) {
      return "0";
    }
  };

  // Parse token amount
  const parseTokenAmount = (amount, decimals = 18) => {
    try {
      return ethers.parseUnits(amount.toString(), decimals);
    } catch (error) {
      throw new Error("Invalid amount format");
    }
  };

  // Check if address has sufficient balance
  const hasSufficientBalance = async (address, requiredAmount) => {
    try {
      const balance = await getTokenBalance(address);
      return balance && BigInt(balance) >= BigInt(requiredAmount);
    } catch (err) {
      console.error("Error checking balance:", err);
      return false;
    }
  };

  // Get network information
  const getNetworkInfo = async () => {
    if (!provider) return null;
    try {
      const network = await provider.getNetwork();
      return {
        chainId: network.chainId.toString(),
        name: network.name,
      };
    } catch (err) {
      console.error("Error getting network info:", err);
      return null;
    }
  };

  // Refresh balance manually
  const refreshBalance = async () => {
    if (account) {
      await loadTokenBalance(account);
    }
  };

  return {
    // State
    account,
    provider,
    signer,
    chainId,
    isConnecting,
    error,
    tokenBalance,
    isLoadingBalance,
    isConnected: !!account,

    // Methods
    connect,
    disconnect,
    clearLocalWalletState,
    loadTokenBalance,
    refreshBalance,
    getTokenBalance,
    getTokenContract,
    getTradeManagerContract,
    getBalance,
    signMessage,
    approveTokens,
    transferTokens,
    createTrade,
    confirmTrade,
    cancelTrade,
    getTradeInfo,
    formatAddress,
    formatTokenBalance,
    parseTokenAmount,
    hasSufficientBalance,
    getNetworkInfo,
  };
};
