import fs from "fs";
import { ethers } from "ethers";
import dotenv from "dotenv";

import routers from "../config/routers.js";
import routerABI from "./routerABI.js";

dotenv.config();

const provider =
    new ethers.JsonRpcProvider(
        process.env.ETH_RPC_URL ||
        "http://127.0.0.1:8545"
    );

const routes =
    JSON.parse(
        fs.readFileSync(
            "./cache/routes.json",
            "utf8"
        )
    );

const INPUT_AMOUNT =
    ethers.parseEther(
        process.env.INPUT_AMOUNT || "1"
    );

function getRouter(name) {

    const router =
        routers.find(
            r => r.name === name
        );

    if (!router)
        throw new Error(
            `Router not found: ${name}`
        );

    return router.router;
}

async function getQuote(
    routerAddress,
    amount,
    path
) {

    try {

        const router =
            new ethers.Contract(
                routerAddress,
                routerABI,
                provider
            );

        const amounts =
            await router.getAmountsOut(
                amount,
                path
            );

        return amounts[
            amounts.length - 1
        ];

    }

    catch (err) {

        console.log(
            "Quote failed:",
            err.shortMessage ??
            err.message
        );

        return 0n;

    }

}

async function calculateRoute(route) {

    const router1 =
        getRouter(
            route.swaps[0].dex
        );

    const router2 =
        getRouter(
            route.swaps[1].dex
        );

    const middle =
        await getQuote(
            router1,
            INPUT_AMOUNT,
            [
                route.path[0],
                route.path[1]
            ]
        );

    if (middle === 0n)
        return null;

    const output =
        await getQuote(
            router2,
            middle,
            [
                route.path[1],
                route.path[2]
            ]
        );

    if (output === 0n)
        return null;

    const profit =
        output - INPUT_AMOUNT;

    return {

        path: route.path,

        dex: [
            route.swaps[0].dex,
            route.swaps[1].dex
        ],

        input: INPUT_AMOUNT,

        output,

        profit

    };

}

async function findBestRoute() {

    console.log(
        "Best Route Finder Started"
    );

    console.log(
        "Routes:",
        routes.length
    );

    let best = null;

    for (const route of routes) {

        const result =
            await calculateRoute(
                route
            );

        if (!result)
            continue;

        console.log("\nRoute");
        console.log(
            result.dex.join(" -> ")
        );

        console.log(
            "Input:",
            ethers.formatEther(
                result.input
            ),
            "WETH"
        );

        console.log(
            "Output:",
            ethers.formatEther(
                result.output
            ),
            "WETH"
        );

        console.log(
            "Profit:",
            ethers.formatEther(
                result.profit
            ),
            "WETH"
        );

        // Ignore losing routes
        if (result.profit <= 0n)
            continue;

        if (
            !best ||
            result.profit > best.profit
        ) {
            best = result;
        }

    }

    if (!best) {

        console.log(
            "\nNo profitable route found."
        );

        if (
            fs.existsSync(
                "./cache/bestRoutes.json"
            )
        ) {
            fs.unlinkSync(
                "./cache/bestRoutes.json"
            );
        }

        return;

    }

    console.log(
        "\n========== BEST ROUTE =========="
    );

    console.log(
        "Path:",
        best.path
    );

    console.log(
        "DEX:",
        best.dex
    );

    console.log(
        "Input:",
        ethers.formatEther(
            best.input
        ),
        "WETH"
    );

    console.log(
        "Output:",
        ethers.formatEther(
            best.output
        ),
        "WETH"
    );

    console.log(
        "Profit:",
        ethers.formatEther(
            best.profit
        ),
        "WETH"
    );

    fs.writeFileSync(

        "./cache/bestRoutes.json",

        JSON.stringify(

            best,

            (_, value) =>
                typeof value === "bigint"
                    ? value.toString()
                    : value,

            2

        )

    );

    console.log(
        "\ncache/bestRoutes.json updated"
    );

}

findBestRoute().catch(error => {

    console.error(error);

    process.exit(1);

});