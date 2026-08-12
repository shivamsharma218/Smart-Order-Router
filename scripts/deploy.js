import { network } from "hardhat";


async function main() {

    const { ethers } = await network.connect();


    console.log("Deploying SwapExecutor...");


    const [deployer] =
        await ethers.getSigners();



    console.log(
        "Deployer:",
        deployer.address
    );



    const SwapExecutor =
        await ethers.getContractFactory(
            "SwapExecutor"
        );



    const executor =
        await SwapExecutor.deploy();



    await executor.waitForDeployment();



    console.log(
        "SwapExecutor:",
        await executor.getAddress()
    );

}


main()
.catch(
    (error)=>{
        console.error(error);
        process.exit(1);
    }
);