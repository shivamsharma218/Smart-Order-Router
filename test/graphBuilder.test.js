import { expect } from "chai";

import { buildGraph } from "../src/graphBuilder.js";

describe("Graph Builder", function () {

    describe("Success", function () {




        it("should build graph from a single pool", function () {

    const pools = [
        {
            token0: "0x111",
            token1: "0x222",
            dex: "UniswapV2",
            pair: "0xAAA"
        }
    ];

    const graph = buildGraph(pools);

    expect(Object.keys(graph)).to.have.lengthOf(2);

    expect(graph["0x111"]).to.have.lengthOf(1);

    expect(graph["0x222"]).to.have.lengthOf(1);

    expect(graph["0x111"][0].token).to.equal("0x222");

    expect(graph["0x222"][0].token).to.equal("0x111");

});




it ("should build graph from multiple pools",function(){
    const pools = [
        {
            token0: "0x111",
            token1: "0x222",
            dex: "UniswapV2",
            pair: "0xAAA"
        },
        {
            
            token0: "0x222",
            token1: "0x333",
            dex: "SushiSwap",
            pair: "0xBBB"
        
        }


    ];



    const graph = buildGraph(pools);

    expect(Object.keys(graph)).to.have.lengthOf(3);

    expect(graph["0x111"]).to.have.lengthOf(1);
    expect(graph["0x222"]).to.have.lengthOf(2);
    expect(graph["0x333"]).to.have.lengthOf(1);
})




it("should connect both tokens bidirectionally",function(){
    const pools = [

        {
            token0: "0xAAA",
            token1: "0xBBB",
            dex: "UniswapV2",
            pair: "0xPAIR"
        }

    ];

    const graph = buildGraph(pools);

    expect(graph["0xAAA"][0].token).to.equal("0xBBB");

     expect(graph["0xBBB"][0].token).to.equal("0xAAA");


});




it("should create adjacency list correctly", function () {

    const pools = [
        {
            token0: "0x111",
            token1: "0x222",
            dex: "UniswapV2",
            pair: "0xAAA"
        },
        {
            token0: "0x111",
            token1: "0x333",
            dex: "SushiSwap",
            pair: "0xBBB"
        }
    ];

    const graph = buildGraph(pools);

    expect(graph["0x111"]).to.have.lengthOf(2);

    expect(graph["0x111"][0].token)
        .to.equal("0x222");

    expect(graph["0x111"][1].token)
        .to.equal("0x333");

});











    });



    describe("Edge Cases", function () {



    });



    describe("Data Integrity", function () {



    });

});