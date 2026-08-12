import fs from "fs";
import tokens from "../config/tokens.js";


const pools = JSON.parse(
    fs.readFileSync(
        "./cache/pools.json",
        "utf8"
    )
);



const WETH =
    tokens[1].toLowerCase();



function buildGraph(pools) {


    const graph = {};


    for (const pool of pools) {


        const token0 =
            pool.token0.toLowerCase();


        const token1 =
            pool.token1.toLowerCase();



        if (!graph[token0])
            graph[token0] = [];


        if (!graph[token1])
            graph[token1] = [];



        graph[token0].push({

            token: token1,

            dex: pool.dex,

            pair: pool.pair

        });



        graph[token1].push({

            token: token0,

            dex: pool.dex,

            pair: pool.pair

        });


    }


    return graph;

}




function findRoutes(
    graph,
    startToken
){


    const routes = [];


    const first =
        graph[startToken] || [];



    for(const hop1 of first){


        const middle =
            hop1.token;



        const second =
            graph[middle] || [];



        for(const hop2 of second){



            // return to WETH

            if(
                hop2.token !== startToken
            )
            continue;



            // avoid same pool

            if(
                hop1.pair === hop2.pair
            )
            continue;



            routes.push({

                path:[
                    startToken,
                    middle,
                    startToken
                ],


                swaps:[
                    hop1,
                    hop2
                ]

            });



        }


    }


    return routes;

}




function removeDuplicates(routes){


    const seen = new Set();


    return routes.filter(route=>{


        const key =
            route.swaps
            .map(
                s=>s.pair.toLowerCase()
            )
            .sort()
            .join("-");



        if(seen.has(key))
            return false;



        seen.add(key);

        return true;


    });


}





async function main(){


    console.log(
        "Route Finder Started"
    );


    console.log(
        "Pools Loaded:",
        pools.length
    );



    const graph =
        buildGraph(pools);



    console.log(
        "Tokens:",
        Object.keys(graph).length
    );



    console.log(
        "Searching routes from WETH:",
        WETH
    );



    let routes =
        findRoutes(
            graph,
            WETH
        );



    routes =
        removeDuplicates(routes);



    console.log(
        "Routes Found:",
        routes.length
    );



    fs.writeFileSync(

        "./cache/routes.json",

        JSON.stringify(
            routes,
            null,
            2
        )

    );



    console.log(
        "cache/routes.json updated"
    );



    console.log(
        "\nSample Routes:"
    );


    routes
    .slice(0,10)
    .forEach(
        (r,i)=>{


            console.log(
                i+1,
                r.path
            );


        }
    );


}



main()
.catch(console.error);