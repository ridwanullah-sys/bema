const { ethers } = require("hardhat")

async function BemaNFT() {
    const { deployer } = await getNamedAccounts()
    const BemaNFT = await ethers.getContract("BemaNFT", deployer)

    const Mint = await BemaNFT.MintNft()
    console.log(Mint)
}

BemaNFT()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error)
        process.exit(1)
    })
