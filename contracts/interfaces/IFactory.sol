// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;
interface IFactory {

    function allPairsLength()
        external
        view
        returns(uint);

    function allPairs(uint)
        external
        view
        returns(address);

}