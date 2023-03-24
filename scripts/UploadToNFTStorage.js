const { ethers, waffle } = require("hardhat")

const main = async () => {
    const provider = waffle.provider
    const songDetails = {
        artistEmailAddress: "okoyeshaggi@gmail.com",
        artistFullName: "Mr shaggi Samuel",
        artistStageName: "Cybridii",
        projectSongName: "77mopolsss",
        projectType: "romance",
        recordLabelName: "unpotableNation",
        featuredArtists: [
            "0x976EA74026E726554dB657fA54763abd0C3a0aa9",
            "0x9965507D1a55bcC2695C58ba16FB37d819B0A4dc",
        ],
        artworkHash: "mdklmdmdmwmdwekldmwkldmwkldmwdklmwedkl",
        primaryMusicGenre: "Omo! me ano sabi watn be genre oo",
        secondaryMusicGenre: "secondary Music genre",
        languageOfPerformance: "azabajania",
        songwriters: ["cora", "yk", "chicken"],
        songwritersWallets: [
            "0x90F79bf6EB2c4f870365E785982E1f101E93b906",
            "0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65",
        ],
        price: ethers.utils.parseUnits("1", 4),
        AudioHash: "bafybeidoffw2r5gft46dlrr6brau2ct32vynnt6zngpvjquqjc7nkcp3b4",
    }
    const { deployer, user } = await getNamedAccounts()
    const contract = await ethers.getContract("BemaChain", user)
    // await contract.transferOwnership("0xB0acF74E5a0295A40915a8229Ea56CEc53379916")
    // console.log("ownership transfered")
    const initialDeployerBalance = await provider.getBalance(deployer)
    const mintfee = await contract.mintFee()
    const tx = await contract.createToken(songDetails, { value: mintfee })
    await tx.wait()
    console.log(user)
    console.log(deployer)
    const finalDeployerBalance = await provider.getBalance(deployer)
    const songData = await contract.getSongData(4)

    const amountReceived = finalDeployerBalance.sub(initialDeployerBalance)
    console.log(amountReceived.toString())
}

main().catch((err) => {
    console.error(err)
    process.exit(1)
})
