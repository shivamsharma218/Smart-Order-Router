import { ethers } from "ethers";
import dotenv from "dotenv";

dotenv.config();


const provider =
    new ethers.JsonRpcProvider(
        "http://127.0.0.1:8545"
    );


const wallet =
    new ethers.Wallet(
        process.env.PRIVATE_KEY,
        provider
    );


const abi = [
    "function addRouter(address router) external",
    "function allowedRouters(address) view returns(bool)"
];


const executor =
    new ethers.Contract(
        process.env.EXECUTOR_ADDRESS,
        abi,
        wallet
    );


const routers = [

    "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D",
    "0xd9e1ce17f2641f24ae83637ab66a2cca9c378b9f"

];


for (const router of routers) {


    const status =
        await executor.allowedRouters(router);


    console.log(
        router,
        status
    );


    if (!status) {


        const tx =
            await executor.addRouter(router);


        await tx.wait();


        console.log(
            "Added:",
            router
        );


    } else {

        console.log(
            "Already exists:",
            router
        );

    }

}