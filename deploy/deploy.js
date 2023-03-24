const { network, getNamedAccounts, ethers } = require("hardhat")
const { verify } = require("../utils/verify")

module.exports = async function ({ deployments }) {
    const { deploy, log } = deployments
    const { deployer } = await getNamedAccounts()
    const args = [ethers.utils.parseEther("0.0000001")]

    log("-----------deploying BemaChain------------")
    const BemaChain = await deploy("BemaChain", {
        from: deployer,
        args: args,
        log: true,
        waitConfirmations: network.config.blockConfirmations || 1,
    })
    log("-------------- verifying ------------------")

    await verify(BemaChain.address, args)

    log("--------------------------------------------")
}

module.exports.tags = ["all", "profiler", "main"]
