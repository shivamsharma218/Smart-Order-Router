import fs from "fs";

const pools = JSON.parse(
    fs.readFileSync("./cache/pools.json","utf8")
);


export function buildGraph(pools){

    const graph={};


    for(const pool of pools){

        const {
            token0,
            token1,
            dex,
            pair
        } = pool;


        if(!graph[token0])
            graph[token0]=[];


        if(!graph[token1])
            graph[token1]=[];



        graph[token0].push({

            token:token1,
            dex,
            pair,
            pool

        });



        graph[token1].push({

            token:token0,
            dex,
            pair,
            pool

        });


    }


    return graph;

}



const graph = buildGraph(pools);


fs.writeFileSync(
    "./cache/graph.json",
    JSON.stringify(
        graph,
        null,
        2
    )
);


console.log(
    "Graph Built:",
    Object.keys(graph).length,
    "tokens"
);