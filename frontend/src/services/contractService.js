import { ethers } from "ethers";
import SwingoldABI from "../shared-abis/SwingoldABI.json";
import TradeManagerABI from "../shared-abis/TradeManagerABI.json";

class ContractService {
  constructor() {
    this.SWINGOLD_ADDRESS = process.env.REACT_APP_SWINGOLD_ADDRESS;
    this.TRADE_MANAGER_ADDRESS = process.env.REACT_APP_TRADE_MANAGER_ADDRESS;

    if (!this.SWINGOLD_ADDRESS || !this.TRADE_MANAGER_ADDRESS) {
      console.error("Contract addresses not configured in environment variables");
    }
  }

  /**
   * Get Web3 provider
   */
  getProvider() {
    if (!window.ethereum) {
      throw new Error("MetaMask not detected. Please install MetaMask!");
    }
    return new ethers.BrowserProvider(window.ethereum);
  }

  /**
   * Get signer for transactions
   */
  async getSigner() {
    const provider = this.getProvider();
    return await provider.getSigner();
  }

  /**
   * Get Swingold token contract instance
   */
  getTokenContract(signer = null) {
    if (!this.SWINGOLD_ADDRESS) {
      throw new Error("Swingold contract address not configured");
    }

    if (signer) {
      return new ethers.Contract(this.SWINGOLD_ADDRESS, SwingoldABI, signer);
    } else {
      const provider = this.getProvider();
      return new ethers.Contract(this.SWINGOLD_ADDRESS, SwingoldABI, provider);
    }
  }

  /**
   * Get TradeManager contract instance
   */
  getTradeManagerContract(signer = null) {
    if (!this.TRADE_MANAGER_ADDRESS) {
      throw new Error("TradeManager contract address not configured");
    }

    if (signer) {
      return new ethers.Contract(this.TRADE_MANAGER_ADDRESS, TradeManagerABI, signer);
    } else {
      const provider = this.getProvider();
      return new ethers.Contract(this.TRADE_MANAGER_ADDRESS, TradeManagerABI, provider);
    }
  }

  /**
   * Get token balance for an address
   */
  async getTokenBalance(address) {
    try {
      const tokenContract = this.getTokenContract();
      const balance = await tokenContract.balanceOf(address);
      return balance;
    } catch (error) {
      console.error("Error getting token balance:", error);
      throw error;
    }
  }

  /**
   * Approve tokens for spending
   */
  async approveTokens(spenderAddress, amount) {
    try {
      const signer = await this.getSigner();
      const tokenContract = this.getTokenContract(signer);
      const tx = await tokenContract.approve(spenderAddress, amount);
      return tx; // Return the transaction object, let the caller handle waiting
    } catch (error) {
      console.error("Error approving tokens:", error);
      throw error;
    }
  }

  /**
   * Create a trade
   */
  async createTrade(sellerAddress, itemName, itemCategory, price) {
    try {
      const signer = await this.getSigner();
      const tradeContract = this.getTradeManagerContract(signer);
      const tx = await tradeContract.createTrade(sellerAddress, itemName, itemCategory, price);
      return tx; // Return the transaction object, let the caller handle waiting
    } catch (error) {
      console.error("Error creating trade:", error);
      throw error;
    }
  }

  /**
   * Confirm a trade
   */
  async confirmTrade(itemName) {
    try {
      const signer = await this.getSigner();
      const tradeContract = this.getTradeManagerContract(signer);
      const tx = await tradeContract.confirmTrade(itemName);
      return tx; // Return the transaction object, let the caller handle waiting
    } catch (error) {
      console.error("Error confirming trade:", error);
      throw error;
    }
  }

  /**
   * Cancel a trade
   */
  async cancelTrade(itemName) {
    try {
      const signer = await this.getSigner();
      const tradeContract = this.getTradeManagerContract(signer);
      const tx = await tradeContract.cancelTrade(itemName);
      return tx; // Return the transaction object, let the caller handle waiting
    } catch (error) {
      console.error("Error canceling trade:", error);
      throw error;
    }
  }

  /**
   * Get trade information
   */
  async getTradeInfo(itemName) {
    try {
      const tradeContract = this.getTradeManagerContract();
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
    } catch (error) {
      console.error("Error getting trade info:", error);
      throw error;
    }
  }

  /**
   * Transfer tokens directly
   */
  async transferTokens(toAddress, amount) {
    try {
      const signer = await this.getSigner();
      const tokenContract = this.getTokenContract(signer);
      const tx = await tokenContract.transfer(toAddress, amount);
      return tx; // Return the transaction object, let the caller handle waiting
    } catch (error) {
      console.error("Error transferring tokens:", error);
      throw error;
    }
  }

  /**
   * Deposit ETH and receive tokens
   */
  async depositETH(amount) {
    try {
      const signer = await this.getSigner();
      const tokenContract = this.getTokenContract(signer);
      const tx = await tokenContract.deposit({ value: amount });
      return await tx.wait();
    } catch (error) {
      console.error("Error depositing ETH:", error);
      throw error;
    }
  }

  /**
   * Withdraw ETH by burning tokens
   */
  async withdrawETH(amount) {
    try {
      const signer = await this.getSigner();
      const tokenContract = this.getTokenContract(signer);
      const tx = await tokenContract.withdraw(amount);
      return await tx.wait();
    } catch (error) {
      console.error("Error withdrawing ETH:", error);
      throw error;
    }
  }

  /**
   * Get transfer history for an address
   */
  async getTransferHistory(address) {
    try {
      const tokenContract = this.getTokenContract();
      const history = await tokenContract.getHistory(address);
      return history;
    } catch (error) {
      console.error("Error getting transfer history:", error);
      throw error;
    }
  }

  /**
   * Parse transaction receipt for events
   */
  parseTransactionReceipt(receipt, contractType = "trade") {
    try {
      const contract = contractType === "trade" ? this.getTradeManagerContract() : this.getTokenContract();

      const events = [];
      for (const log of receipt.logs) {
        try {
          const parsed = contract.interface.parseLog(log);
          events.push(parsed);
        } catch {
          // Ignore logs that can't be parsed
        }
      }
      return events;
    } catch (error) {
      console.error("Error parsing transaction receipt:", error);
      return [];
    }
  }

  /**
   * Format token amount for display
   */
  formatTokenAmount(amount, decimals = 18) {
    if (!amount) return "0";
    return ethers.formatUnits(amount, decimals);
  }

  /**
   * Parse token amount from user input
   */
  parseTokenAmount(amount, decimals = 18) {
    if (!amount) return ethers.parseUnits("0", decimals);
    return ethers.parseUnits(amount.toString(), decimals);
  }

  /**
   * Check if user has sufficient balance
   */
  async hasSufficientBalance(address, requiredAmount) {
    try {
      const balance = await this.getTokenBalance(address);
      return balance >= requiredAmount;
    } catch (error) {
      console.error("Error checking balance:", error);
      return false;
    }
  }

  /**
   * Get network information
   */
  async getNetworkInfo() {
    try {
      const provider = this.getProvider();
      const network = await provider.getNetwork();
      return {
        chainId: network.chainId,
        name: network.name,
      };
    } catch (error) {
      console.error("Error getting network info:", error);
      throw error;
    }
  }
}

// Export singleton instance
const contractService = new ContractService();
export default contractService;
