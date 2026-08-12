// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

contract MockBadToken {

    function approve(
        address,
        uint256
    )
        external
        pure
        returns(bool)
    {
        return false;
    }

    function transfer(
        address,
        uint256
    )
        external
        pure
        returns(bool)
    {
        return false;
    }

    function transferFrom(
        address,
        address,
        uint256
    )
        external
        pure
        returns(bool)
    {
        return false;
    }

}