// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

interface TradeEvents {
    // Emitted when a new trade is created
    event TradeCreated(uint256 indexed id, address indexed buyer, address indexed seller, uint256 price, string itemName);

    // Emitted when a trade is successfully confirmed by the buyer
    event TradeConfirmed(uint256 indexed id);

    // Emitted when a trade is cancelled or timed out
    event TradeCancelled(uint256 indexed id);
}
