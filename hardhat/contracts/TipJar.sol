// SPDX-License-Identifier: MIT

pragma solidity 0.8.28;

contract TipJar {
    error InvalidAddress();
    error InvalidAmount();
    error NoTipToWithdraw();

    // Mapping to track tips
    mapping(address => uint256) public tips;

    // Allow tipping the creator
    function tipCreator(address creator) public payable {
        require(creator != address(0), InvalidAddress());
        require(msg.value > 0, InvalidAmount());

        tips[creator] += msg.value;
    }

    // Allow the creator to withdraw their tips
    function withdraw() public {
        uint256 amount = tips[msg.sender];

        require(amount > 0, NoTipToWithdraw());

        // Reset the balance
        tips[msg.sender] = 0;

        payable(msg.sender).transfer(amount);
    }
}
