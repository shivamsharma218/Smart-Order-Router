import { ethers } from "ethers";
import dotenv from "dotenv";

dotenv.config();

const RPC_URL = "http://127.0.0.1:8545";

const WETH =
    "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2";

const WETH_ABI = [
    "function deposit() payable",
    "function balanceOf(address) view returns(uint256)",
    "function approve(address,uint256) returns(bool)",
    "function allowance(address,address) view returns(uint256)"
];

async function main() {

    const provider =
        new ethers.JsonRpcProvider(RPC_URL);

    const wallet =
        new ethers.Wallet(
            process.env.PRIVATE_KEY,
            provider
        );

    const executor =
        process.env.EXECUTOR_ADDRESS;

    if (!executor)
        throw new Error("EXECUTOR_ADDRESS missing");

    console.log("Wallet:", wallet.address);

    await provider.send(
        "hardhat_setBalance",
        [
            wallet.address,
            "0x3635C9ADC5DEA00000"
        ]
    );

    console.log("ETH funded");

    console.log(
        "ETH:",
        ethers.formatEther(
            await provider.getBalance(wallet.address)
        )
    );

    const weth =
        new ethers.Contract(
            WETH,
            WETH_ABI,
            wallet
        );

    let nonce =
        await provider.getTransactionCount(
            wallet.address,
            "pending"
        );

    console.log("Current Nonce:", nonce);

    const wethBalance =
        await weth.balanceOf(wallet.address);

    if (wethBalance < ethers.parseEther("10")) {

        console.log("Depositing WETH...");

        const depositTx =
            await weth.deposit({
                value: ethers.parseEther("10"),
                nonce: nonce++
            });

        await depositTx.wait();

        console.log(
            "Deposit:",
            depositTx.hash
        );
    }

    const newBalance =
        await weth.balanceOf(wallet.address);

    console.log(
        "WETH:",
        ethers.formatEther(newBalance)
    );

    const allowance =
        await weth.allowance(
            wallet.address,
            executor
        );

    if (allowance === 0n) {

        console.log("Approving Executor...");

        const approveTx =
            await weth.approve(
                executor,
                ethers.MaxUint256,
                {
                    nonce: nonce++
                }
            );

        await approveTx.wait();

        console.log(
            "Approve:",
            approveTx.hash
        );
    }
    else {

        console.log(
            "Already Approved"
        );
    }

    console.log(
        "Allowance:",
        ethers.formatEther(
            await weth.allowance(
                wallet.address,
                executor
            )
        )
    );

    console.log("\nWallet ready for swaps");
}

main().catch((err) => {
    console.error(err);
    process.exit(1);
});