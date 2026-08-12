import { exec } from "child_process";


function run(command){

    return new Promise((resolve, reject)=>{

        console.log("\n", command);


        exec(command,(error,stdout,stderr)=>{

            if(error){
                console.log(stderr);
                reject(error);
                return;
            }


            console.log(stdout);
            resolve();

        });

    });

}



async function main(){

try{

    console.log(
        " Smart Order Router Automation"
    );


    await run(
    "node src/discoverPools.js"
);


await run(
    "node src/graphBuilder.js"
);


await run(
    "node src/routeFinder.js"
);


await run(
    "node src/bestRoute.js"
);


await run(
    "node src/executeSwap.js"
);


    console.log(
        " Swap completed"
    );


}
catch(err){

    console.log(
        " Automation failed:",
        err.message
    );

}

}


main();