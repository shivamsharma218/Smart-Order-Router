import { ethers } from "ethers";
import dotenv from "dotenv";
import fs from "fs";

import executorABI from "../abi/executorABI.js";
import routers from "../config/routers.js";

dotenv.config();


const RPC_URL =
    process.env.ETH_RPC_URL ||
    "http://127.0.0.1:8545";


const WETH =
    "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2";



const WETH_ABI = [

    "function balanceOf(address) view returns(uint256)",

    "function allowance(address,address) view returns(uint256)",

    "function approve(address,uint256) returns(bool)"

];


// 0.5%
const SLIPPAGE = 50;



async function main(){


    const provider =
        new ethers.JsonRpcProvider(
            RPC_URL
        );


    const wallet =
        new ethers.Wallet(
            process.env.PRIVATE_KEY,
            provider
        );


    console.log(
        "RPC:",
        RPC_URL
    );


    console.log(
        "Wallet:",
        wallet.address
    );



    const executor =
        new ethers.Contract(
            process.env.EXECUTOR_ADDRESS,
            executorABI,
            wallet
        );



    const route =
        JSON.parse(
            fs.readFileSync(
                "./cache/bestRoutes.json",
                "utf8"
            )
        );



    console.log(
        "\nLoaded Route:"
    );

    console.log(route);



    const dex1 =
        routers.find(
            r => r.name === route.dex[0]
        );


    const dex2 =
        routers.find(
            r => r.name === route.dex[1]
        );



    if(!dex1)
        throw new Error(
            `Router ${route.dex[0]} not found`
        );


    if(!dex2)
        throw new Error(
            `Router ${route.dex[1]} not found`
        );



    const router1 =
        dex1.router;


    const router2 =
        dex2.router;



    console.log(
        "\nRouter1:",
        router1
    );


    console.log(
        "Router2:",
        router2
    );



    const weth =
        new ethers.Contract(
            WETH,
            WETH_ABI,
            wallet
        );



    const ethBalance =
        await provider.getBalance(
            wallet.address
        );


    console.log(
        "ETH:",
        ethers.formatEther(
            ethBalance
        )
    );



    const wethBalance =
        await weth.balanceOf(
            wallet.address
        );


    console.log(
        "WETH:",
        ethers.formatEther(
            wethBalance
        )
    );



    const amountIn =
        BigInt(
            route.input
        );



    if(wethBalance < amountIn){

        throw new Error(
            "Not enough WETH"
        );

    }



    

    const amountOutMin =
        BigInt(route.output) *
        BigInt(10000 - SLIPPAGE) /
        10000n;



    console.log(
        "\nExpected Output:",
        ethers.formatEther(
            BigInt(route.output)
        )
    );


    console.log(
        "Minimum Output:",
        ethers.formatEther(
            amountOutMin
        )
    );



    const allowance =
        await weth.allowance(
            wallet.address,
            process.env.EXECUTOR_ADDRESS
        );



    if(allowance < amountIn){


        console.log(
            "Approving WETH..."
        );



        const approve =
            await weth.approve(
                process.env.EXECUTOR_ADDRESS,
                ethers.MaxUint256
            );


        await approve.wait();



        console.log(
            "WETH Approved"
        );


    }
    else{


        console.log(
            "Already approved"
        );


    }




    const tokenIn =
        route.path[0];


    const tokenMid =
        route.path[1];


    const tokenOut =
        route.path[2];



    console.log(
        "\nSwap Path:"
    );


    console.log(
        tokenIn,
        "->",
        tokenMid,
        "->",
        tokenOut
    );



    const deadline =
        Math.floor(
            Date.now()/1000
        ) + 600;



    console.log(
        "\nExecuting Swap..."
    );



   

const tx = await executor.executeSwap(
    [
        router1,
        router2
    ],
    route.path,
    amountIn,
    amountOutMin,
    deadline
);






    console.log(
        "Transaction:",
        tx.hash
    );



    const receipt =
        await tx.wait();



    console.log(
        "\nSwap Success!"
    );


    console.log(
        "Block:",
        receipt.blockNumber
    );


    console.log(
        "Gas:",
        receipt.gasUsed.toString()
    );



    const finalWeth =
        await weth.balanceOf(
            wallet.address
        );



    console.log(
        "Final WETH:",
        ethers.formatEther(
            finalWeth
        )
    );


}



main()
.catch(
    err => {

        console.error(err);

        process.exit(1);

    }
);