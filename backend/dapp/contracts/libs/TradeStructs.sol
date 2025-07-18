// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

struct Trade {
    uint256 id;          
    address buyer;       
    address seller;      
    string itemName;     
    uint256 itemPrice;   
    uint256 createdAt;   
    bool confirmed;      
    bool completed;      
}
