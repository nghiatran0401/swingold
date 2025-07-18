// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

// This contract is a custom token (ERC20) that represents the Swinburne Gold.
// It allows users to transfer tokens between addresses and track their history.

contract Token is ERC20 {
    address public owner;

    struct HistoryRecord {
        address counterparty;
        uint256 amount;
        uint256 timestamp;
    }

    mapping(address => HistoryRecord[]) public history;

    event GoldSent(address indexed from, address indexed to, uint256 amount);

    modifier onlyOwner() {
        require(msg.sender == owner, "Not owner");
        _;
    }

    constructor(uint256 initialSupply) ERC20("Token", "GLD") {
        owner = msg.sender;
        _mint(msg.sender, initialSupply);
    }

    // Transfers tokens from caller to recipient
    function transferGold(address to, uint256 amount) public returns (bool) {
        _transfer(msg.sender, to, amount);
        history[msg.sender].push(HistoryRecord(to, amount, block.timestamp));
        history[to].push(HistoryRecord(msg.sender, amount, block.timestamp));
        emit GoldSent(msg.sender, to, amount);
        return true;
    }

    // Returns the caller's balance
    function getMyBalance() public view returns (uint256) {
        return balanceOf(msg.sender);
    }

    // Returns the balance of a specific user
    function getBalanceOf(address user) public view returns (uint256) {
        return balanceOf(user);
    }

    // Return the user history transfer
    function getHistory(address user) public view returns (HistoryRecord[] memory) {
        return history[user];
    }
}
