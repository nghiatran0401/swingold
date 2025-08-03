// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./Swingold.sol";
import "./libs/TradeEvents.sol";
import "./libs/TradeStructs.sol";

contract TradeManager is TradeEvents {
    using TradeStructs for TradeStructs.Trade;

    mapping(string => TradeStructs.Trade) public trades;
    Swingold public token;

    constructor(address payable tokenAddress) {
        token = Swingold(tokenAddress); // Payable-compatible
    }

    /// @notice Create a new trade
    function createTrade(
        address seller,
        string memory itemName,
        string memory itemCategory,
        uint256 itemPrice
    ) external {
        require(seller != address(0), "Invalid seller");
        require(token.balanceOf(msg.sender) >= itemPrice, "Insufficient SG");
        require(token.allowance(msg.sender, address(this)) >= itemPrice, "Not approved to spend SG");
        require(trades[itemName].createdAt == 0, "Trade already exists");

        trades[itemName] = TradeStructs.Trade({
            buyer: msg.sender,
            seller: seller,
            itemName: itemName,
            itemCategory: itemCategory,
            itemPrice: itemPrice,
            createdAt: block.timestamp,
            confirmed: false,
            completed: false
        });

        emit TradeCreated(msg.sender, seller, itemName, itemPrice, block.timestamp);
    }

    /// @notice Confirm the trade within time limit
    function confirmTrade(string memory itemName) external {
        TradeStructs.Trade storage t = trades[itemName];
        require(t.buyer == msg.sender, "Only buyer can confirm");
        require(!t.confirmed && !t.completed, "Already handled");
        require(block.timestamp <= t.createdAt + 10 minutes, "Trade expired");

        require(token.transferFrom(msg.sender, t.seller, t.itemPrice), "Transfer failed");
        t.confirmed = true;
        t.completed = true;

        emit TradeConfirmed(t.buyer, t.seller, itemName, block.timestamp);
    }

    /// @notice Cancel trade before confirmation
    function cancelTrade(string memory itemName) external {
        TradeStructs.Trade storage t = trades[itemName];
        require(t.buyer == msg.sender, "Only buyer can cancel");
        require(!t.confirmed && !t.completed, "Cannot cancel");

        delete trades[itemName];

        emit TradeCancelled(msg.sender, itemName, block.timestamp);
    }

    /// @notice Expire trade after timeout (public call)
    function expireTrade(string memory itemName) external {
        TradeStructs.Trade storage t = trades[itemName];
        require(!t.confirmed && !t.completed, "Already handled");
        require(block.timestamp > t.createdAt + 10 minutes, "Not yet expired");

        address expiredBuyer = t.buyer;
        delete trades[itemName];

        emit TradeExpired(expiredBuyer, itemName, block.timestamp);
    }
}
