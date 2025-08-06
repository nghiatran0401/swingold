import React, { createContext, useContext, useState, useEffect } from "react";
import { useWallet } from "../hooks/useWallet";

const WalletContext = createContext();

export const useWalletContext = () => {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error("useWalletContext must be used within a WalletProvider");
  }
  return context;
};

export const WalletProvider = ({ children }) => {
  const wallet = useWallet();
  const [walletDisplayInfo, setWalletDisplayInfo] = useState({
    isConnected: false,
    address: null,
    formattedAddress: "",
    tokenBalance: null,
    formattedTokenBalance: "0",
    isLoading: false,
  });

  // Update display info when wallet state changes
  useEffect(() => {
    const formatAddress = (address) => {
      if (!address) return "";
      return `${address.slice(0, 6)}...${address.slice(-4)}`;
    };

    const formatTokenBalance = (balance) => {
      if (!balance) return "0";
      return wallet.formatTokenBalance ? wallet.formatTokenBalance(balance) : "0";
    };

    setWalletDisplayInfo({
      isConnected: wallet.isConnected,
      address: wallet.account,
      formattedAddress: formatAddress(wallet.account),
      tokenBalance: wallet.tokenBalance,
      formattedTokenBalance: formatTokenBalance(wallet.tokenBalance),
      isLoading: wallet.isLoadingBalance,
    });
  }, [wallet.isConnected, wallet.account, wallet.tokenBalance, wallet.isLoadingBalance]);

  const value = {
    ...wallet,
    displayInfo: walletDisplayInfo,
  };

  return <WalletContext.Provider value={value}>{children}</WalletContext.Provider>;
};
