// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "./interfaces/IERC20.sol";
import "./interfaces/IUniswapV2Router02.sol";

contract SwapExecutor {

    address public owner;

    mapping(address => bool) public allowedRouters;


    error NotOwner();
    error RouterNotAllowed();
    error TransferFailed();
    error ApproveFailed();
    error NoProfit();
    error InvalidPath();
    error InvalidRouters();


    event RouterAdded(
        address router
    );


    event SwapExecuted(
        address indexed user,
        address[] path,
        address[] routers,
        uint256 amountIn,
        uint256 amountOut
    );


    modifier onlyOwner() {
        if(msg.sender != owner)
            revert NotOwner();

        _;
    }


    constructor() {
        owner = msg.sender;
    }


    function addRouter(
        address router
    )
        external
        onlyOwner
    {
        allowedRouters[router] = true;

        emit RouterAdded(router);
    }



    function executeSwap(
        address[] calldata routers,
        address[] calldata path,
        uint256 amountIn,
        uint256 amountOutMin,
        uint256 deadline
    )
        external
        returns(uint256 amountOut)
    {

       


        if(path.length < 2)
            revert InvalidPath();


        

        if(
            routers.length != path.length - 1
        )
            revert InvalidRouters();



        for(uint i = 0; i < routers.length; i++)
        {
            if(!allowedRouters[routers[i]])
                revert RouterNotAllowed();
        }



       

        if(
            !IERC20(path[0])
            .transferFrom(
                msg.sender,
                address(this),
                amountIn
            )
        )
            revert TransferFailed();



        uint256 currentAmount = amountIn;



        


        for(uint i = 0; i < routers.length; i++)
        {

            address tokenIn =
                path[i];


            address tokenOut =
                path[i + 1];


            if(
                !IERC20(tokenIn)
                .approve(
                    routers[i],
                    currentAmount
                )
            )
                revert ApproveFailed();



            address[] memory swapPath =
                new address[](2);


            swapPath[0] = tokenIn;
            swapPath[1] = tokenOut;



            uint[] memory amounts =
                IUniswapV2Router02(
                    routers[i]
                )
                .swapExactTokensForTokens(
                    currentAmount,
                    1,
                    swapPath,
                    address(this),
                    deadline
                );



            currentAmount =
                amounts[
                    amounts.length - 1
                ];
        }



        amountOut = currentAmount;



     

        if(amountOut < amountIn)
            revert NoProfit();



        if(amountOut < amountOutMin)
            revert NoProfit();



        

        if(
            !IERC20(
                path[path.length - 1]
            )
            .transfer(
                msg.sender,
                amountOut
            )
        )
            revert TransferFailed();



        emit SwapExecuted(
            msg.sender,
            path,
            routers,
            amountIn,
            amountOut
        );
    }



    function removeRouter(
        address router
    )
        external
        onlyOwner
    {
        allowedRouters[router] = false;
    }


}