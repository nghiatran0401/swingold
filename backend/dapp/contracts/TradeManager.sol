// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "./interfaces/MyToken.sol";
import "./libs/TradeStructs.sol";
import "./libs/TradeEvents.sol";

// This contract manages trades between buyers and sellers using a custom token (defined in MyToken.sol). 
// It allows users to create, confirm, and cancel trades for digital items, with a built-in time limit for confirmation.

contract TradeManager is TradeEvents {
    address public owner;
    MyToken public token;

    uint256 public tradeCount;
    mapping(uint256 => Trade) public trades;

    constructor(address tokenAddress) {
        owner = msg.sender;
        token = MyToken(tokenAddress);
    }

    modifier onlyBuyer(uint256 tradeId) {
        require(trades[tradeId].buyer == msg.sender, "Not buyer");
        _;
    }

    // Creates a new trade between the buyer and a seller
    function createTrade(address _seller, string memory _itemName, uint256 _itemPrice) public {
        require(token.balanceOf(msg.sender) >= _itemPrice, "Insufficient Gold");

        tradeCount++;
        trades[tradeCount] = Trade({
            id: tradeCount,
            buyer: msg.sender,
            seller: _seller,
            itemName: _itemName,
            itemPrice: _itemPrice,
            createdAt: block.timestamp,
            confirmed: false,
            completed: false
        });

        emit TradeCreated(tradeCount, msg.sender, _seller, _itemPrice, _itemName);
    }

    // Confirms the trade within the allowed time (10 mins max)
    function confirmTrade(uint256 tradeId) public onlyBuyer(tradeId) {
        Trade storage t = trades[tradeId];
        require(!t.completed && !t.confirmed, "Already done");
        require(block.timestamp <= t.createdAt + 10 minutes, "Expired");

        t.confirmed = true;
        t.completed = true;
        token.transferFrom(t.buyer, t.seller, t.itemPrice);
    emit TradeConfirmed(tradeId);
    }

    // Cancels the trade if it hasn't been completed or expired
    function cancelTrade(uint256 tradeId) public {
        Trade storage t = trades[tradeId];
        require(!t.completed, "Already done");
        require(msg.sender == t.buyer || block.timestamp > t.createdAt + 10 minutes, "Not allowed");

        t.completed = true;
        emit TradeCancelled(tradeId);
    }
}
