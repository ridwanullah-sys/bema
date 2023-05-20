const { assert, expect } = require("chai")
const { getNamedAccounts, deployments, ethers } = require("hardhat")

describe("Bema Coin", () => {
    let deployer, BemaCoin, accounts
    beforeEach(async () => {
        deployer = (await getNamedAccounts()).deployer
        await deployments.fixture("all")
        BemaCoin = await ethers.getContract("BemaCoin")
        accounts = await ethers.getSigners()
    })

    describe("sets_maxSupply", () => {
        it("sets maximum Supply", async () => {
            const tx = await BemaCoin.sets_maxSupply(ethers.utils.parseEther("20"))
            await tx.wait()
            const maxSupply = await BemaCoin.s_maxSupply()
            assert.equal(ethers.utils.parseEther("20").toString(), maxSupply.toString())
        })
    })

    describe("mintToken", () => {
        it("reverts if amount > 0 and percentagefromAvailable > 0", async () => {
            await expect(
                BemaCoin.mintToken(ethers.utils.parseEther("20"), 20, [
                    { account: accounts[1].address, value: 20, mode: "P" },
                ])
            ).to.be.revertedWith("BEMACoin_PleaseSpecifyRewardMode")
        })
        it("reverts if amount is less <= 0 and percentagefromAvailable <= 0", async () => {
            await expect(
                BemaCoin.mintToken(ethers.utils.parseEther("0"), 0, [
                    { account: accounts[1].address, value: 20, mode: "P" },
                ])
            ).to.be.revertedWith("BEMACoin_PleaseSpecifyRewardMode")
        })
        it("reverts if amount less than 0", async () => {
            await expect(
                BemaCoin.mintToken(-1, 20, [{ account: accounts[1].address, value: 20, mode: "P" }])
            ).to.be.reverted
        })
        it("reverts if percentagefromAvailable less than 0", async () => {
            await expect(
                BemaCoin.mintToken(ethers.utils.parseEther("20"), -2, [
                    { account: accounts[1].address, value: 20, mode: "A" },
                ])
            ).to.be.reverted
        })

        it("reverts if mode != P or A", async () => {
            await expect(
                BemaCoin.mintToken(ethers.utils.parseEther("20"), 0, [
                    { account: accounts[1].address, value: 20, mode: "C" },
                ])
            ).to.be.revertedWith("BEMACoin_ModeMustEitherBe_P_Or_A_")
        })
        it("reverts if amount > s_available", async () => {
            const available = await BemaCoin.s_available()
            await expect(
                BemaCoin.mintToken(available.add(1), 0, [
                    { account: accounts[1].address, value: 20, mode: "P" },
                ])
            ).to.be.revertedWith("BEMACoin_AmountHigherThanAvailable")
        })
        it("reverts nodes is not equal through out", async () => {
            await expect(
                BemaCoin.mintToken(ethers.utils.parseEther("20"), 0, [
                    {
                        account: accounts[1].address,
                        value: 10,
                        mode: "P",
                    },
                    {
                        account: accounts[2].address,
                        value: 11,
                        mode: "P",
                    },
                    {
                        account: accounts[3].address,
                        value: 70,
                        mode: "A",
                    },
                    {
                        account: accounts[4].address,
                        value: 10,
                        mode: "P",
                    },
                ])
            ).to.be.revertedWith("BEMACoin_IndividualModeMustBeSame")
        })

        it("reverts if mode P and total is greater than 100", async () => {
            // const percentage = 50
            // const available = await BemaCoin.s_available()
            // const percentageValue = available.mul(percentage).div(100)
            // console.log(percentageValue.toString())
            await expect(
                BemaCoin.mintToken(ethers.utils.parseEther("20"), 0, [
                    {
                        account: accounts[1].address,
                        value: 10,
                        mode: "P",
                    },
                    {
                        account: accounts[2].address,
                        value: 11,
                        mode: "P",
                    },
                    {
                        account: accounts[3].address,
                        value: 70,
                        mode: "P",
                    },
                    {
                        account: accounts[4].address,
                        value: 10,
                        mode: "P",
                    },
                ])
            ).to.be.revertedWith("BEMACoin_TotalsShouldEqual100")
        })

        it("reverts if mode A and total is greater than available", async () => {
            await BemaCoin.sets_maxSupply(ethers.utils.parseEther("20"))
            await expect(
                BemaCoin.mintToken(ethers.utils.parseEther("20"), 0, [
                    {
                        account: accounts[1].address,
                        value: ethers.utils.parseEther("11"),
                        mode: "A",
                    },
                    {
                        account: accounts[2].address,
                        value: ethers.utils.parseEther("5"),
                        mode: "A",
                    },
                    {
                        account: accounts[3].address,
                        value: ethers.utils.parseEther("3"),
                        mode: "A",
                    },
                    {
                        account: accounts[4].address,
                        value: ethers.utils.parseEther("2"),
                        mode: "A",
                    },
                ])
            ).to.be.revertedWith("BEMACoin_TotalShouldEqualAmount")
        })

        it("reverts if percentage > 100", async () => {
            await expect(
                BemaCoin.mintToken(ethers.utils.parseEther("0"), 101, [
                    { account: accounts[1].address, value: 20, mode: "P" },
                ])
            ).to.be.revertedWith("BEMACoin_PercentageMustBeAbove100")
        })

        it("Updates available with perc", async () => {
            const percentage = 20
            const s_maxSupply = await BemaCoin.s_maxSupply()
            const totalMints = s_maxSupply.mul(percentage).div(100)
            const remainder = s_maxSupply.sub(totalMints)
            const tx = await BemaCoin.mintToken(ethers.utils.parseEther("0"), percentage, [
                { account: accounts[1].address, value: 100, mode: "P" },
            ])
            await tx.wait()
            const available = await BemaCoin.s_available()
            assert.equal(available.toString(), remainder.toString())
        })

        it("Updates available with amount", async () => {
            const s_maxSupply = await BemaCoin.s_maxSupply()
            const totalMints = ethers.utils.parseEther("20")
            const remainder = s_maxSupply.sub(totalMints)
            const tx = await BemaCoin.mintToken(totalMints, 0, [
                { account: accounts[1].address, value: 100, mode: "P" },
            ])
            await tx.wait()
            const available = await BemaCoin.s_available()
            assert.equal(available.toString(), remainder.toString())
        })

        it("transferes tokens Mode A", async () => {
            const initialAcc1Balance = await BemaCoin.balanceOf(accounts[1].address)
            const initialAcc2Balance = await BemaCoin.balanceOf(accounts[2].address)
            const initialAcc3Balance = await BemaCoin.balanceOf(accounts[3].address)
            const initialAcc4Balance = await BemaCoin.balanceOf(accounts[4].address)
            const tx = await BemaCoin.mintToken(ethers.utils.parseEther("20"), 0, [
                {
                    account: accounts[1].address,
                    value: ethers.utils.parseEther("10"),
                    mode: "A",
                },
                {
                    account: accounts[2].address,
                    value: ethers.utils.parseEther("5"),
                    mode: "A",
                },
                {
                    account: accounts[3].address,
                    value: ethers.utils.parseEther("3"),
                    mode: "A",
                },
                {
                    account: accounts[4].address,
                    value: ethers.utils.parseEther("2"),
                    mode: "A",
                },
            ])
            await tx.wait()
            const finalAcc1Balance = await BemaCoin.balanceOf(accounts[1].address)
            const finalAcc2Balance = await BemaCoin.balanceOf(accounts[2].address)
            const finalAcc3Balance = await BemaCoin.balanceOf(accounts[3].address)
            const finalAcc4Balance = await BemaCoin.balanceOf(accounts[4].address)
            assert.equal(
                initialAcc1Balance.add(ethers.utils.parseEther("10")).toString(),
                finalAcc1Balance.toString()
            )
            assert.equal(
                initialAcc2Balance.add(ethers.utils.parseEther("5")).toString(),
                finalAcc2Balance.toString()
            )
            assert.equal(
                initialAcc3Balance.add(ethers.utils.parseEther("3")).toString(),
                finalAcc3Balance.toString()
            )
            assert.equal(
                initialAcc4Balance.add(ethers.utils.parseEther("2")).toString(),
                finalAcc4Balance.toString()
            )
        })

        it("transferes tokens Mode P", async () => {
            const initialAcc1Balance = await BemaCoin.balanceOf(accounts[1].address)
            const initialAcc2Balance = await BemaCoin.balanceOf(accounts[2].address)
            const initialAcc3Balance = await BemaCoin.balanceOf(accounts[3].address)
            const initialAcc4Balance = await BemaCoin.balanceOf(accounts[4].address)
            const amount = ethers.utils.parseEther("20")
            const amountSentTo1 = amount.mul(50).div(100)
            const amountSentTo2 = amount.mul(20).div(100)
            const amountSentTo3 = amount.mul(20).div(100)
            const amountSentTo4 = amount.mul(10).div(100)
            const tx = await BemaCoin.mintToken(amount, 0, [
                {
                    account: accounts[1].address,
                    value: 50,
                    mode: "P",
                },
                {
                    account: accounts[2].address,
                    value: 20,
                    mode: "P",
                },
                {
                    account: accounts[3].address,
                    value: 20,
                    mode: "P",
                },
                {
                    account: accounts[4].address,
                    value: 10,
                    mode: "P",
                },
            ])
            await tx.wait()
            const finalAcc1Balance = await BemaCoin.balanceOf(accounts[1].address)
            const finalAcc2Balance = await BemaCoin.balanceOf(accounts[2].address)
            const finalAcc3Balance = await BemaCoin.balanceOf(accounts[3].address)
            const finalAcc4Balance = await BemaCoin.balanceOf(accounts[4].address)
            assert.equal(
                initialAcc1Balance.add(amountSentTo1).toString(),
                finalAcc1Balance.toString()
            )
            assert.equal(
                initialAcc2Balance.add(amountSentTo2).toString(),
                finalAcc2Balance.toString()
            )
            assert.equal(
                initialAcc3Balance.add(amountSentTo3).toString(),
                finalAcc3Balance.toString()
            )
            assert.equal(
                initialAcc4Balance.add(amountSentTo4).toString(),
                finalAcc4Balance.toString()
            )
        })
    })
})
