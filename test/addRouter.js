import { expect } from "chai";
import hre from "hardhat";

describe("SwapExecutor", function () {

    let owner;
    let user;

    let executor;
    let router;

    beforeEach(async function () {

        const { ethers } =
            await hre.network.connect();

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

    });

    describe("addRouter", function () {

        describe("Success", function () {

            it("should add router successfully", async function () {

                await executor.addRouter(
                    await router.getAddress()
                );

                expect(
                    await executor.allowedRouters(
                        await router.getAddress()
                    )
                ).to.equal(
                    true
                );

            });

            it("should emit RouterAdded event", async function () {

                await expect(

                    executor.addRouter(
                        await router.getAddress()
                    )

                )
                    .to.emit(
                        executor,
                        "RouterAdded"
                    )
                    .withArgs(
                        await router.getAddress()
                    );

            });

        });

        describe("Failure", function () {

            it("should revert if non owner adds router", async function () {

                await expect(

                    executor
                        .connect(user)
                        .addRouter(
                            await router.getAddress()
                        )

                )
                    .to.be.revertedWithCustomError(
                        executor,
                        "NotOwner"
                    );

            });

        });

    });

});