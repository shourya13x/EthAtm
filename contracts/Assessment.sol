// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

contract Assessment {
    address payable public owner;

    event Deposit(uint256 amount);
    event Withdraw(uint256 amount);
    event OwnerChanged(address indexed oldOwner, address indexed newOwner);

    constructor() payable {
        owner = payable(msg.sender);
    }

    function getBalance() public view returns(uint256){
        return address(this).balance;
    }

    function deposit() public payable {
        require(msg.value > 0, "Deposit amount must be greater than zero");
        emit Deposit(msg.value);
    }

    error InsufficientBalance(uint256 balance, uint256 withdrawAmount);

    function withdraw(uint256 _withdrawAmount) public {
        require(msg.sender == owner, "You are not the owner of this account");
        if (address(this).balance < _withdrawAmount) {
            revert InsufficientBalance({
                balance: address(this).balance,
                withdrawAmount: _withdrawAmount
            });
        }

        (bool success, ) = owner.call{value: _withdrawAmount}("");
        require(success, "Transfer failed");

        emit Withdraw(_withdrawAmount);
    }

    function showOwner() public view returns (address) {
        return owner;
    }

    function changeOwner(address payable newOwner) public {
        require(msg.sender == owner, "You are not the owner of this account");
        address oldOwner = owner;
        owner = newOwner;
        emit OwnerChanged(oldOwner, newOwner);
    }
}
