const { network, getNamedAccounts, ethers } = require("hardhat")
const { verify } = require("../utils/verify")

module.exports = async function ({ deployments }) {
    const { deploy, log } = deployments
    const { deployer } = await getNamedAccounts()
    const argsBemachain = [ethers.utils.parseEther("0.0000001")]
    const argsBemaNFT = ["0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266"]

    log("-----------deploying BemaChain------------")
    const BemaNFT = await deploy("BemaNFT", {
        from: deployer,
        args: argsBemaNFT,
        log: true,
        waitConfirmations: network.config.blockConfirmations || 1,
    })

    const BemaCoin = await deploy("BemaCoin", {
        from: deployer,
        args: [],
        log: true,
        waitConfirmations: network.config.blockConfirmations || 1,
    })

    // const BemaChain = await deploy("BemaChain", {
    //     from: deployer,
    //     args: args,
    //     log: true,
    //     waitConfirmations: network.config.blockConfirmations || 1,
    // })
    // log("-------------- verifying ------------------")

    //await verify(BemaChain.address, args)

    log("--------------------------------------------")
}

module.exports.tags = ["all", "profiler", "main"]
