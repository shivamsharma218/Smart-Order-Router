   // SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;
   interface IPair {

    function token0()
        external
        view
        returns(address);

    function token1()
        external
        view
        returns(address);

    function getReserves()
        external
        view
        returns(
            uint112,
            uint112,
            uint32
        );

}