// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

// This interface defines the functions that a custom token (ERC20) must implement.
interface MyToken {
    // Transfers tokens from a specific address to another using allowance
    function transferFrom(address from, address to, uint256 amount) external returns (bool);
    
    // Approves a spender to transfer tokens on behalf of caller
    function approve(address spender, uint256 amount) external returns (bool);
    
    // Transfers tokens from caller to recipient
    function transfer(address to, uint256 amount) external returns (bool);
    
    // Returns token balance of a given address
    function balanceOf(address account) external view returns (uint256);

    // Returns how many tokens spender can still use from owner's account
    function allowance(address owner, address spender) external view returns (uint256);
}
