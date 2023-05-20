// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "./BemaNFT.sol";

error BemaChain__IncorrectMintFeeSent();
error BemaChain__BemaNFTAddressNotSet();

contract BemaChain is Ownable {
    uint256 public s_mintFee = 0.001 ether;
    BemaNFT public bemaNFT;
    bool public NFTAddressIsSet;

    // Struct for storing project/song information
    struct SongDetails {
        string artistEmailAddress;
        string artistFullName;
        string artistStageName;
        string projectSongName;
        string projectType;
        string recordLabelName;
        address[] featuredArtists;
        string artworkHash;
        string primaryMusicGenre;
        string secondaryMusicGenre;
        string languageOfPerformance;
        string[] songwriters;
        address[] songwritersWallets;
        uint256 price;
        string AudioHash;
    }

    struct Song {
        SongDetails SongDetails;
        address Owner;
        bool forSale;
        bool tokenExist;
    }

    function setBemaNFTAdress(BemaNFT nftAddress) public onlyOwner {
        bemaNFT = nftAddress;
    }

    function createToken(SongDetails memory _songDetails) public payable returns (uint256) {
        if (!NFTAddressIsSet) {
            revert BemaChain__BemaNFTAddressNotSet();
        }

        if (msg.value != s_mintFee) {
            revert BemaChain__IncorrectMintFeeSent();
        }
        Song memory _song = Song({
            SongDetails: _songDetails,
            Owner: msg.sender,
            forSale: true,
            tokenExist: true
        });
        uint256 newItemId = bemaNFT._MintNft(_song, msg.sender);
        emit SongDataCreated(newItemId, _songDetails, msg.sender);
        return newItemId;
    }

    function getSongData(uint256 tokenId) public view returns (Song memory) {
        if (!NFTAddressIsSet) {
            revert BemaChain__BemaNFTAddressNotSet();
        }
        return bemaNFT._tokenURI(tokenId);
    }

    // Function to update project/song information for a given token ID
    function updateSongData(uint256 tokenId, SongDetails memory _songDetails) public {
        if (!NFTAddressIsSet) {
            revert BemaChain__BemaNFTAddressNotSet();
        }
        if (!bemaNFT._tokenURI(tokenId).tokenExist) {
            revert BemaNFT__TokenDoesNotExist();
        }
        if (bemaNFT._tokenURI(tokenId).Owner != msg.sender) {
            revert BemaNFT__CurrentCallerNotAuthorized();
        }
        Song memory _song = Song({
            SongDetails: _songDetails,
            Owner: msg.sender,
            forSale: true,
            tokenExist: true
        });
        bemaNFT.setTokenURI(tokenId, _song);
        emit SongDataUpdated(tokenId);
    }

    function deleteSong(uint256 tokenId) public view {}

    function updateMinFee(uint256 newFee) public onlyOwner {
        s_mintFee = newFee;
    }

    // Function to get the total number of ERC-1155 tokens
    function getTotalTokens() public view returns (uint256) {
        return bemaNFT.getTotalTokens();
    }

    // Event to signal that the Song data has been created
    event SongDataCreated(uint256 tokenId, SongDetails _SongDetails, address Owner);

    // Event to signal that the Song data has been updated
    event SongDataUpdated(uint256 tokenId);

    // Event to signal that a token has been purchased
    event TokenPurchased(uint256 tokenId, address buyer);
}
