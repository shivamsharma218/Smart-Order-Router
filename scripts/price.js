import { ethers } from "ethers";
import dotenv from "dotenv";

import routers from "../config/routers.js";
import routerABI from "../src/routerABI.js";

dotenv.config();


const RPC =
    "http://127.0.0.1:8545";


const provider =
    new ethers.JsonRpcProvider(
        RPC
    );


const HOLDER =
    "0x28C6c06298d514Db089934071355E5743bf21d60";


const WBTC =
    "0x2260fac5e5542a773aa44fbcfedf7c193bc2c599";


const WETH =
    "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2";


const ERC20_ABI = [

    "function balanceOf(address) view returns(uint256)",

    "function approve(address,uint256) returns(bool)",

    "function allowance(address,address) view returns(uint256)"

];



const SWAP_AMOUNT =
    ethers.parseUnits(
        "10",
        8
    );


const LOOPS = 5;


const DELAY = 5000;



function sleep(ms){

    return new Promise(
        resolve => setTimeout(resolve, ms)
    );

}



async function main(){


    console.log(
        "Fork loop simulation started"
    );


    console.log(
        "Block:",
        await provider.getBlockNumber()
    );



    console.log(
        "Impersonating:",
        HOLDER
    );


    await provider.send(
        "hardhat_impersonateAccount",
        [
            HOLDER
        ]
    );



    await provider.send(
        "hardhat_setBalance",
        [
            HOLDER,
            "0x3635C9ADC5DEA00000"
        ]
    );



    const signer =
        new ethers.JsonRpcSigner(
            provider,
            HOLDER
        );



    console.log(
        "Signer:",
        await signer.getAddress()
    );



    const routerAddress =
        routers[0].router;



    console.log(
        "Router:",
        routerAddress
    );



    const router =
        new ethers.Contract(
            routerAddress,
            routerABI,
            signer
        );



    const wbtc =
        new ethers.Contract(
            WBTC,
            ERC20_ABI,
            signer
        );



    const weth =
        new ethers.Contract(
            WETH,
            [
                "function balanceOf(address) view returns(uint256)"
            ],
            provider
        );




    const allowance =
        await wbtc.allowance(
            HOLDER,
            routerAddress
        );



    if(
        allowance < SWAP_AMOUNT
    ){

        console.log(
            "Approving router..."
        );


        const tx =
            await wbtc.approve(
                routerAddress,
                ethers.MaxUint256
            );


        await tx.wait();


        console.log(
            "Approved:",
            tx.hash
        );

    }
    else{

        console.log(
            "Already approved"
        );

    }




    for(
        let i = 1;
        i <= LOOPS;
        i++
    ){


        console.log(
            `\nSwap ${i}/${LOOPS}`
        );



        const balance =
            await wbtc.balanceOf(
                HOLDER
            );



        console.log(
            "WBTC:",
            ethers.formatUnits(
                balance,
                8
            )
        );



        if(
            balance < SWAP_AMOUNT
        ){

            console.log(
                "Not enough WBTC"
            );

            break;

        }




        const deadline =
            Math.floor(
                Date.now()/1000
            ) + 600;



        const tx =
            await router.swapExactTokensForTokens(

                SWAP_AMOUNT,

                1,

                [
                    WBTC,
                    WETH
                ],

                HOLDER,

                deadline

            );



        console.log(
            "TX:",
            tx.hash
        );


        await tx.wait();



        const wethBalance =
            await weth.balanceOf(
                HOLDER
            );


        console.log(
            "WETH:",
            ethers.formatEther(
                wethBalance
            )
        );



        if(i !== LOOPS){

            console.log(
                `Waiting ${DELAY/1000}s`
            );


            await sleep(
                DELAY
            );

        }

    }



    await provider.send(
        "hardhat_stopImpersonatingAccount",
        [
            HOLDER
        ]
    );


    console.log(
        "\nSimulation completed"
    );

}



main()
.catch(
    error => {

        console.error(error);

        process.exit(1);

    }
);