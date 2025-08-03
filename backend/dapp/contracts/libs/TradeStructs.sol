// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

library TradeStructs {
    struct Trade {
        address buyer;
        address seller;
        string itemName;
        string itemCategory;
        uint256 itemPrice;
        uint256 createdAt;
        bool confirmed;
        bool completed;
    }
}
