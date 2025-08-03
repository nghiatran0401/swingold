// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract Swingold is ERC20, Ownable {
    struct TransferLog {
        address counterparty;
        uint256 amount;
        uint256 timestamp;
    }

    mapping(address => TransferLog[]) private _history;

    // Owner set via Ownable
    constructor(address initialOwner) ERC20("Swin Gold", "SG") Ownable(initialOwner) {}

    // Admin (owner) awards SwinGold to a student
    function awardStudent(address to, uint256 amount) external onlyOwner {
        _mint(to, amount);
    }

    // Transfer with logging
    function transferGold(address to, uint256 amount) public returns (bool) {
        bool success = transfer(to, amount);
        if (success) {
            _recordTransfer(msg.sender, to, amount);
        }
        return success;
    }

    // Internal logger
    function _recordTransfer(address from, address to, uint256 amount) internal {
        _history[from].push(TransferLog(to, amount, block.timestamp));
        _history[to].push(TransferLog(from, amount, block.timestamp));
    }

    // View transfer history
    function getHistory(address user) external view returns (TransferLog[] memory) {
        return _history[user];
    }

    // Deposit ETH and receive SG (1:1)
    function deposit() public payable {
        require(msg.value > 0, "Send ETH to receive SG");
        _mint(msg.sender, msg.value);
    }

    // Withdraw ETH by burning SG
    function withdraw(uint256 amount) public {
        require(balanceOf(msg.sender) >= amount, "Insufficient SG balance");
        _burn(msg.sender, amount);
        payable(msg.sender).transfer(amount);
    }

    // Mint by owner (used in deploy script to distribute SG)
    function mint(address to, uint256 amount) public onlyOwner {
        _mint(to, amount);
    }

    // Accept ETH directly
    receive() external payable {
        deposit();
    }
}
