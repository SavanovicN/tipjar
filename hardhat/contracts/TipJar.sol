// SPDX-License-Identifier: MIT

pragma solidity 0.8.28;

contract TipJar {
    error InvalidAddress();
    error InvalidAmount();
    error NoTipToWithdraw();
    error ContractCallersNotSupported();

    event TipSent(address indexed tipper, address indexed creator, uint256 amount);
    event Withdrawal(address indexed creator, uint256 amount);

    // Mapping to track tips
    mapping(address => uint256) public tips;

    // Allow tipping the creator
    function tipCreator(address creator) public payable {
        require(creator != address(0), InvalidAddress());
        require(msg.value > 0, InvalidAmount());

        tips[creator] += msg.value;
        
        emit TipSent(msg.sender, creator, msg.value);
    }

    // Allow the creator to withdraw their tips
    function withdraw() public {
        // 
        require(msg.sender.code.length == 0, ContractCallersNotSupported());

        uint256 amount = tips[msg.sender];

        require(amount > 0, NoTipToWithdraw());

        // Reset the balance
        tips[msg.sender] = 0;

        emit Withdrawal(msg.sender, amount);
        // Only EOA can withdraw due to transfer() gas limits
        // so we may update it to use a function call() in the future and
        // for extra safety add ReentrancyGuard as a security measure.
        payable(msg.sender).transfer(amount);
    }
}
