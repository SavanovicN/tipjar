// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

import { TipJar } from "../TipJar.sol";

// Test contract that attempts to withdraw from TipJar
// (should fail due to tx.origin check)
contract AttackerContract {
    TipJar public tipJar;

    constructor(address tipJarAddress) {
        tipJar = TipJar(tipJarAddress);
    }

    function attemptWithdraw() external {
        tipJar.withdraw();
    }

    receive() external payable {}
}
