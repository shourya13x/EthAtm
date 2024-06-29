// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

contract Assessment {
    address payable public owner;

    event Deposit(uint256 amount);
    event Withdraw(uint256 amount);
    event OwnerChanged(address indexed oldOwner, address indexed newOwner);
    event FundsTransferred(address indexed to, uint256 amount);

    constructor() payable {
        owner = payable(msg.sender);
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "You are not the owner of this account");
        _;
    }

    function getBalance() public view returns (uint256) {
        return address(this).balance;
    }

    function deposit() public payable {
        require(msg.value > 0, "Deposit amount must be greater than zero");
        emit Deposit(msg.value);
    }

    error InsufficientBalance(uint256 balance, uint256 withdrawAmount);

    function withdraw(uint256 _withdrawAmount) public onlyOwner {
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

    function changeOwner(address payable newOwner) public onlyOwner {
        require(newOwner != address(0), "New owner address cannot be zero");
        address oldOwner = owner;
        owner = newOwner;
        emit OwnerChanged(oldOwner, newOwner);
    }

    function transferFunds(address payable to, uint256 amount) public onlyOwner {
        require(to != address(0), "Cannot transfer to zero address");
        require(amount > 0, "Transfer amount must be greater than zero");
        if (address(this).balance < amount) {
            revert InsufficientBalance({
                balance: address(this).balance,
                withdrawAmount: amount
            });
        }

        (bool success, ) = to.call{value: amount}("");
        require(success, "Transfer failed");

        emit FundsTransferred(to, amount);
    }
}
