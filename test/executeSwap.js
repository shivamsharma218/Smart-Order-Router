import { expect } from "chai";
import hre from "hardhat";



describe("SwapExecutor", function () {

    let owner;
    let user;

    let executor;
    let ethers;


    let router;
    let router2;

    let tokenA;
    let tokenB;
    let tokenC;

    let badToken;

    beforeEach(async function () {

        const connection =
            await hre.network.connect();


        ethers =
            connection.ethers;


        [owner, user] =
            await ethers.getSigners();


        const SwapExecutor =
            await ethers.getContractFactory(
                "SwapExecutor"
            );

        executor =
            await SwapExecutor.deploy();

        await executor.waitForDeployment();



        const MockRouter =
            await ethers.getContractFactory(
                "MockRouter"
            );

        router =
            await MockRouter.deploy();

        await router.waitForDeployment();

        router2 =
            await MockRouter.deploy();

        await router2.waitForDeployment();



        const MockERC20 =
            await ethers.getContractFactory(
                "MockERC20"
            );

        tokenA =
            await MockERC20.deploy(
                "Token A",
                "TKA"
            );

        await tokenA.waitForDeployment();

        tokenB =
            await MockERC20.deploy(
                "Token B",
                "TKB"
            );

        await tokenB.waitForDeployment();


        tokenC =
            await MockERC20.deploy(
                "Token C",
                "TKC"
            );

        await tokenC.waitForDeployment();




        const MockBadToken =
            await ethers.getContractFactory(
                "MockBadToken"
            );

        badToken =
            await MockBadToken.deploy();

        await badToken.waitForDeployment();

    });



    describe("Validation", function () {



        it("should revert if path length is  less than 2", async function () {
            await expect(
                executor.executeSwap(
                    [],
                    [
                        await tokenA.getAddress()
                    ],
                    100,
                    100,
                    9999999999999
                )
            ).to.be.revertedWithCustomError(
                executor,
                "InvalidPath"
            );
        });



        it("should revert if routers length does not match path length", async function () {

            await expect(
                executor.executeSwap(
                    [
                        await router.getAddress()
                    ],
                    [
                        await tokenA.getAddress(),
                        await tokenB.getAddress(),
                        await tokenA.getAddress()
                    ],
                    100,
                    100,
                    9999999
                )
            ).to.be.revertedWithCustomError(
                executor,
                "InvalidRouters"
            );

        });

        it("should revert if router is not allowed", async function () {
            await expect(

                executor.executeSwap(
                    [await router.getAddress(),

                    ],
                    [
                        await tokenA.getAddress(),
                        await tokenB.getAddress()
                    ],
                    100,
                    100,
                    9999999999
                )
            ).to.be.revertedWithCustomError(
                executor,
                "RouterNotAllowed"
            );


        });






        it("should revert if any router is not allowed", async function () {
            await expect(
                executor.executeSwap(
                    [
                        await router.getAddress(),
                        await router2.getAddress()
                    ],
                    [
                        await tokenA.getAddress(),
                        await tokenB.getAddress(),
                        await tokenA.getAddress()
                    ],
                    100,
                    100,
                    999999

                )
            ).to.be.revertedWithCustomError(
                executor,
                "RouterNotAllowed"
            )



        });







    });



    describe("Transfer", function () {




        it("should revert if transferFrom fails", async function () {


            await executor.addRouter(
                await router.getAddress()
            );

            await expect(

                executor.executeSwap(
                    [
                        await router.getAddress()
                    ],
                    [
                        await badToken.getAddress(),
                        await tokenB.getAddress()
                    ],
                    100,
                    100,
                    9999999999
                )

            ).to.be.revertedWithCustomError(
                executor,
                "TransferFailed"
            );


        });








        it("should revert when router has insufficient output token balance", async function () {

            await executor.addRouter(
                await router.getAddress()
            );

            await tokenA.mint(
                user.address,
                1000
            );

            await tokenA.
                connect(user).
                approve(
                    await executor.getAddress(),
                    1000
                );


            await expect(

                executor.
                    connect(user)
                    .executeSwap(
                        [
                            await router.getAddress()
                        ],
                        [
                            await tokenA.getAddress(),
                            await tokenB.getAddress()
                        ],
                        100,
                        100,
                        9999999
                    )
            ).to.be.revertedWith(
                "balance"
            );



        });

    });










    describe("Profit", function () {


        it("should execute route only when it is profitable", async function () {

            const amountIn =
                ethers.parseEther("10");


            await executor.addRouter(
                await router.getAddress()
            );


            await tokenA.mint(
                user.address,
                amountIn
            );


            await tokenB.mint(
                await router.getAddress(),
                ethers.parseEther("20")
            );


            await tokenA
                .connect(user)
                .approve(
                    await executor.getAddress(),
                    amountIn
                );


            const before =
                await tokenB.balanceOf(
                    user.address
                );


            await executor
                .connect(user)
                .executeSwap(
                    [
                        await router.getAddress()
                    ],
                    [
                        await tokenA.getAddress(),
                        await tokenB.getAddress()
                    ],
                    amountIn,
                    ethers.parseEther("1"),
                    9999999999
                );


            const after =
                await tokenB.balanceOf(
                    user.address
                );


            expect(after)
                .to.be.gt(before);

        });





        it("should revert when route is not profitable", async function () {

            const amountIn =
                ethers.parseEther("10");


            await executor.addRouter(
                await router.getAddress()
            );



            await tokenA.mint(
                user.address,
                amountIn
            );



            await tokenA
                .connect(user)
                .approve(
                    await executor.getAddress(),
                    amountIn
                );



            await expect(

                executor
                    .connect(user)
                    .executeSwap(
                        [
                            await router.getAddress()
                        ],
                        [
                            await tokenA.getAddress(),
                            await tokenB.getAddress()
                        ],
                        amountIn,
                        ethers.parseEther("1000"),
                        9999999999
                    )

            )
                .to.be.revert(ethers);

        });










        describe("Success", function () {




            it("should execute swap successfully", async function () {

                const amountIn =
                    ethers.parseEther("10");


                await executor.addRouter(
                    await router.getAddress()
                );


                await tokenA.mint(
                    user.address,
                    amountIn
                );


                await tokenB.mint(
                    await router.getAddress(),
                    ethers.parseEther("20")
                );


                await tokenA
                    .connect(user)
                    .approve(
                        await executor.getAddress(),
                        amountIn
                    );


                await expect(

                    executor
                        .connect(user)
                        .executeSwap(
                            [
                                await router.getAddress()
                            ],
                            [
                                await tokenA.getAddress(),
                                await tokenB.getAddress()
                            ],
                            amountIn,
                            0,
                            9999999999
                        )

                )
                    .not.to.be.revert(ethers);


            });




            it("should send output token to user", async function () {
                const amountIn =
                    ethers.parseEther("10");

                await executor.addRouter(
                    await router.getAddress()
                );

                await tokenA.mint(
                    user.address,
                    amountIn
                );

                await tokenB.mint(
                    await router.getAddress(),
                    ethers.parseEther("500")
                );

                await tokenA
                    .connect(user)
                    .approve(
                        await executor.getAddress(),
                        amountIn
                    );



                const before =
                    await tokenB.balanceOf(
                        user.address
                    );



                await executor
                    .connect(user)
                    .executeSwap(
                        [
                            await router.getAddress()
                        ],
                        [
                            await tokenA.getAddress(),
                            await tokenB.getAddress()
                        ],
                        amountIn,
                        0,
                        999999
                    );





                const after =
                    await tokenB.balanceOf(
                        user.address
                    );


                expect(after)
                    .to.be.gt(before);
            });






            it("should expect  multi hop route  succesfully ", async function () {
                const amountIn =
                    ethers.parseEther("5");


                await executor.addRouter(

                    await router.getAddress()
                );

                await tokenA.mint(
                    user.address,
                    amountIn
                );

                await tokenB.mint(
                    await router.getAddress(),
                    ethers.parseEther("250")
                );



                await tokenA.
                    connect(user)
                    .approve(
                        await executor.getAddress(),
                        amountIn
                    );


                await expect(

                    executor.
                        connect(user)
                        .executeSwap(

                            [
                                await router.getAddress(),
                                await router.getAddress()
                            ],

                            [

                                await tokenA.getAddress(),
                                await tokenB.getAddress(),
                                await tokenA.getAddress()
                            ],

                            amountIn,
                            0,
                            999999
                        )
                ).not.to.be.revert(ethers);
            });

            it("should allow different users to execute swaps", async function () {


                const amount =
                    ethers.parseEther("2");


                await executor.addRouter(
                    await router.getAddress()
                );


                await tokenA.mint(
                    user.address,
                    amount
                );


                await tokenB.mint(
                    await router.getAddress(),
                    ethers.parseEther("10")
                );


                await tokenA
                    .connect(user)
                    .approve(
                        await executor.getAddress(),
                        amount
                    );


                await expect(

                    executor
                        .connect(user)
                        .executeSwap(
                            [
                                await router.getAddress()
                            ],
                            [
                                await tokenA.getAddress(),
                                await tokenB.getAddress()
                            ],
                            amount,
                            0,
                            9999999999
                        )

                )
                    .not.to.be.revert(ethers);


            });




            it ("should execute swap when minimum output requirement is satisfied ",async function(){
                const amountIn =
                ethers.parseEther("10");

                const minAmountOut =
                ethers.parseEther("5");


                await executor.addRouter(
                    await router.getAddress()
                );


                await tokenA.mint(
                    user.address,
                    amountIn
                );


                await tokenB.mint(
                    await router.getAddress(),
                    ethers.parseEther("10")
                );


                await tokenA
                .connect(user)
                .approve(
                    await executor.getAddress(),
                    amountIn
                );


                await expect(
                    executor.
                    connect(user)
                    .executeSwap(
                        [
                            await router.getAddress()
                        ],
                        [
                            await tokenA.getAddress(),
                            await tokenB.getAddress()
                        ],
                        amountIn,
                        minAmountOut,
                        9999999
                    )
                ).not.to.be.revert(ethers);

            })






















        });

    });

});