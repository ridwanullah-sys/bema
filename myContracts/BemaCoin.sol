// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

error BEMACoin_MaxSupplyExceeded();
error BEMACoin_PleaseSpecifyRewardMode();
error BEMACoin_ModeMustEitherBe_P_Or_A_();
error BEMACoin_IndividualModeMustBeSame();
error BEMACoin_TotalsShouldEqual100();
error BEMACoin_TotalShouldEqualAmount();
error BEMACoin_AmountHigherThanAvailable();
error BEMACoin_PercentageMustBeAbove100();

contract BemaCoin is ERC20, Ownable {
    struct Rewardee {
        address account;
        uint256 value;
        string mode;
    }
    uint256 public s_maxSupply = 200000000 ether;
    uint256 public s_available = s_maxSupply;

    constructor() ERC20("BemaCoin", "BMCoin") {}

    function sets_maxSupply(uint256 _maxSupply) public onlyOwner {
        s_maxSupply = _maxSupply;
        s_available = s_maxSupply;
    }

    function mintToken(
        uint256 amount,
        uint256 percentagefromAvailable,
        Rewardee[] memory accounts
    ) public onlyOwner {
        uint256 mintingAmount;
        if (
            (amount > 0 && percentagefromAvailable > 0) ||
            (amount <= 0 && percentagefromAvailable <= 0) ||
            (amount < 0) ||
            (percentagefromAvailable < 0)
        ) {
            revert BEMACoin_PleaseSpecifyRewardMode();
        }
        if (
            (keccak256(abi.encodePacked(accounts[0].mode)) != keccak256(abi.encodePacked("P"))) &&
            (keccak256(abi.encodePacked(accounts[0].mode)) != keccak256(abi.encodePacked("A")))
        ) {
            revert BEMACoin_ModeMustEitherBe_P_Or_A_();
        }
        string memory mode = accounts[0].mode;
        if (amount > 0 && percentagefromAvailable == 0) {
            if (amount > s_available) {
                revert BEMACoin_AmountHigherThanAvailable();
            }
            uint256 total;
            for (uint i = 0; i < accounts.length; i++) {
                if (
                    keccak256(abi.encodePacked(accounts[i].mode)) !=
                    keccak256(abi.encodePacked(mode))
                ) {
                    revert BEMACoin_IndividualModeMustBeSame();
                }

                total += accounts[i].value;

                if (keccak256(abi.encodePacked(mode)) == keccak256(abi.encodePacked("P"))) {
                    if (total > 100) {
                        revert BEMACoin_TotalsShouldEqual100();
                    }
                    mintingAmount = (accounts[i].value * amount) / 100;
                } else if (keccak256(abi.encodePacked(mode)) == keccak256(abi.encodePacked("A"))) {
                    if (total > amount) {
                        revert BEMACoin_TotalShouldEqualAmount();
                    }
                    mintingAmount = accounts[i].value;
                }
                _mint(accounts[i].account, mintingAmount);
            }
        } else if (amount == 0 && percentagefromAvailable > 0) {
            if (percentagefromAvailable > 100) {
                revert BEMACoin_PercentageMustBeAbove100();
            }
            uint256 amountValue = (percentagefromAvailable * s_available) / 100;
            uint256 total;
            for (uint i = 0; i < accounts.length; i++) {
                if (
                    keccak256(abi.encodePacked(accounts[i].mode)) !=
                    keccak256(abi.encodePacked(mode))
                ) {
                    revert BEMACoin_IndividualModeMustBeSame();
                }

                total += accounts[i].value;
                if (keccak256(abi.encodePacked(mode)) == keccak256(abi.encodePacked("P"))) {
                    if (total > 100) {
                        revert BEMACoin_TotalsShouldEqual100();
                    }
                    mintingAmount = (accounts[i].value * amountValue) / 100;
                } else if (keccak256(abi.encodePacked(mode)) == keccak256(abi.encodePacked("A"))) {
                    if (total > amountValue) {
                        revert BEMACoin_TotalShouldEqualAmount();
                    }
                    mintingAmount = accounts[i].value;
                }
                _mint(accounts[i].account, mintingAmount);
            }
        }
        s_available = s_available - mintingAmount;
    }
}
