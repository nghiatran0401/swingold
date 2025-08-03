// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

abstract contract TradeEvents {
    event TradeCreated(
        address indexed buyer,
        address indexed seller,
        string itemName,
        uint256 itemPrice,
        uint256 timestamp
    );

    event TradeConfirmed(
        address indexed buyer,
        address indexed seller,
        string itemName,
        uint256 timestamp
    );

    event TradeCancelled(
        address indexed buyer,
        string itemName,
        uint256 timestamp
    );

    event TradeExpired(
        address indexed buyer,
        string itemName,
        uint256 timestamp
    );
}
