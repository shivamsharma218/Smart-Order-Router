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

   

   

    describe("removeRouter", function () {

        beforeEach(async function() {
            await executor.addRouter(
                await router.getAddress()
            );
        });





        describe("success",function(){
            it("should remove router succesfully",async function(){
                await executor.removeRouter(
                    await router.getAddress()
                );
                expect(
                    await executor.allowedRouters(
                        await router.getAddress()
                    )
                ).to.equal(
                    false
                );
            });






            it("should allow re-adding removed router",async function(){
                await executor.removeRouter(
                    await router.getAddress()
                );
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





        });




        describe("Failure",function(){
            it("should revert if non owner removes router",async function(){
                await expect(

                    executor.connect(user)
                    .removeRouter(
                        await router.getAddress()
                    )
                ).to.be.revertedWithCustomError(
                    executor,
                    "NotOwner"

                );
            });
        });

    });

    

});