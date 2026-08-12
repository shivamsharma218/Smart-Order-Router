// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

interface IERC20 {

    function transferFrom(
        address,
        address,
        uint256
    )
        external
        returns(bool);

    function transfer(
        address,
        uint256
    )
        external
        returns(bool);

}

contract MockRouter {

    uint256 public rate = 100;

    function setRate(
        uint256 newRate
    )
        external
    {
        rate = newRate;
    }

    function swapExactTokensForTokens(

        uint amountIn,
        uint,
        address[] calldata path,
        address to,
        uint

    )
        external
        returns(uint[] memory amounts)
    {

        IERC20(path[0]).transferFrom(
            msg.sender,
            address(this),
            amountIn
        );

        uint amountOut =
            amountIn * rate / 100;

        IERC20(path[1]).transfer(
            to,
            amountOut
        );

        amounts = new uint[](2);

        amounts[0] = amountIn;
        amounts[1] = amountOut;

    }

}