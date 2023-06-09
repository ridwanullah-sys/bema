require("@nomiclabs/hardhat-waffle")
require("@nomiclabs/hardhat-etherscan")
require("hardhat-deploy")
require("solidity-coverage")
require("hardhat-gas-reporter")
require("hardhat-contract-sizer")
require("dotenv").config()

/** @type import('hardhat/config').HardhatUserConfig */

const RINKEBY_RPC_URL = process.env.RINKEBY_RPC_URL || "https://eth-rinkeby"
const GOERLY_RPC_URL = process.env.GOERLY_RPC_URL || "https://eth-goerly"
const PRIVATE_KEY = process.env.PRIVATE_KEY || "0xkey"
const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY || "key"
const COINMARKET_API_KEY = process.env.COINMARKET_API_KEY || "key"
const MAINNET_RPC_URL = process.env.MAINNET_RPC_URL || "key"
const MUMBAI_RPC_URL = process.env.MUMBAI_RPC_URL || "key"
const POLYSCAN_API_KEY = process.env.POLYSCAN_API_KEY || "key"

module.exports = {
    solidity: {
        compilers: [{ version: "0.8.9" }],
    },
    defaultNetwork: "hardhat",
    networks: {
        hardhat: {
            chainId: 31337,
            // forking: {
            //     url: MAINNET_RPC_URL,
            // },
        },
        localhost: {
            chainId: 31337,
        },
        rinkeby: {
            url: RINKEBY_RPC_URL,
            accounts: [PRIVATE_KEY],
            chainId: 4,
            blockConfirmations: 1,
        },
        goerly: {
            url: GOERLY_RPC_URL,
            accounts: [PRIVATE_KEY],
            chainId: 5,
            blockConfirmations: 1,
        },
        mumbai: {
            url: MUMBAI_RPC_URL,
            accounts: [PRIVATE_KEY],
            chainId: 80001,
            blockConfirmations: 1,
        },
        mainnet: {
            url: MAINNET_RPC_URL,
            accounts: [PRIVATE_KEY],
            chainId: 1,
            blockConfirmations: 1,
        },
    },

    gasReporter: {
        enabled: false,
        outputFile: "gas-reporter.txt",
        noColors: true,
        currency: "USD",
        coinmarketcap: COINMARKET_API_KEY,
        token: "ETH",
    },

    namedAccounts: {
        deployer: {
            default: 0,
        },
        user: {
            default: 1,
        },
    },

    mocha: {
        timeout: 300000, // 300 sec max
    },

    etherscan: {
        apiKey: POLYSCAN_API_KEY,
    },
    // polyscan: {
    //     apiKey: POLYSCAN_API_KEY,
    // },
}
