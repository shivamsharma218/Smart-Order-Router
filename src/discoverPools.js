import { ethers } from "ethers";
import fs from "fs";
import dotenv from "dotenv";

import factories from "../config/factories.js";

import factoryABI from "../abi/factoryABI.js";
import pairABI from "../abi/pairABI.js";


dotenv.config();


const MAX_PAIRS_PER_DEX =
    Number(process.env.LIMIT) || 200;


const BATCH_SIZE =
    Number(process.env.BATCH_SIZE) || 20;


const MAX_RETRIES =
    Number(process.env.MAX_RETRIES) || 3;



const provider =
    new ethers.JsonRpcProvider(
        process.env.ETH_RPC_URL
    );



function validateFactories(config){

    for(
        const [name,address]
        of Object.entries(config)
    ){

        if(!ethers.isAddress(address)){

            throw new Error(
                `Invalid factory address ${name}: ${address}`
            );

        }

    }

}



async function withRetry(fn,label){

    let lastError;


    for(
        let attempt=0;
        attempt<=MAX_RETRIES;
        attempt++
    ){

        try{

            return await fn();

        }
        catch(error){

            lastError=error;


            if(attempt===MAX_RETRIES)
                throw error;


            const delay =
                500 * Math.pow(2,attempt);


            console.log(
                `Retry ${label} after ${delay}ms`
            );


            await new Promise(
                r=>setTimeout(r,delay)
            );

        }

    }


    throw lastError;

}




async function processPair(
    factory,
    dex,
    index,
    limit,
    pools,
    counters
){

try{


const pairAddress =
await withRetry(
    ()=>factory.allPairs(index),
    `allPairs ${index}`
);



const pair =
new ethers.Contract(
    pairAddress,
    pairABI,
    provider
);



const [
    token0,
    token1,
    reserves
]
=
await withRetry(
async()=>{

return Promise.all([
    pair.token0(),
    pair.token1(),
    pair.getReserves()
]);

},
`pair read ${index}`
);



if(
    reserves[0]===0n ||
    reserves[1]===0n
){

    counters.skippedZeroReserve++;

    return;

}



pools.push({

    dex:dex.name,

    pair:pairAddress,

    token0,

    token1,

    reserve0:
        reserves[0].toString(),

    reserve1:
        reserves[1].toString()

});



console.log(
`${dex.name} ${index+1}/${limit}`
);



}
catch(error){

counters.failedCalls++;

console.log(
`Failed ${dex.name} ${index}: ${error.message}`
);

}


}






async function main(){


console.log(
"Pool Discovery Started"
);


validateFactories(factories);



const dexes=[

{
name:"UniswapV2",
factory:factories.uniswapV2
},

{
name:"SushiSwap",
factory:factories.sushi
}

];



const pools=[];


const counters={

skippedZeroReserve:0,

failedCalls:0

};




for(
const dex of dexes
){


console.log(
`\nReading ${dex.name}`
);



const factory =
new ethers.Contract(
    dex.factory,
    factoryABI,
    provider
);



const totalPairs =
await factory.allPairsLength();



console.log(
"Total Pairs:",
totalPairs.toString()
);



const limit =
Math.min(
Number(totalPairs),
MAX_PAIRS_PER_DEX
);



for(
let start=0;
start<limit;
start+=BATCH_SIZE
){


const batch=[];


for(
let i=start;
i<Math.min(start+BATCH_SIZE,limit);
i++
){

batch.push(
processPair(
factory,
dex,
i,
limit,
pools,
counters
)
);

}



await Promise.all(batch);



}


}




fs.mkdirSync(
"./cache",
{
recursive:true
}
);



fs.writeFileSync(
"./cache/pools.json",
JSON.stringify(
pools,
null,
2
)
);



console.log();

console.log(
`Saved ${pools.length} pools`
);

console.log(
`Skipped zero reserves: ${counters.skippedZeroReserve}`
);

console.log(
`Failed calls: ${counters.failedCalls}`
);


console.log(
"cache/pools.json updated"
);


}



main()
.catch(error=>{

console.error(error);

process.exitCode=1;

});