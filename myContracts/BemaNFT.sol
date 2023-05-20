// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "base64-sol/base64.sol";
import "./bema.sol";
import "hardhat/console.sol";

error BemaNFT__CurrentCallerNotAuthorized();
error BemaNFT__TokenDoesNotExist();

contract BemaNFT is ERC721URIStorage {
    string public constant IMAGEURI =
        "ipfs/bafkreibwwkxbby6jdr3wzagd45whgddhxcl3hem326tmtrw76234eu6c5y?filename=WIN_20230227_10_20_04_Pro%20(2).jpg";

    address public immutable i_caller;
    Counters.Counter public s_tokenId;

    mapping(address => uint256[]) addressToIds;
    mapping(uint256 => BemaChain.Song) private _tokenURIs;

    constructor(address _caller) ERC721("BEMA", "BEMA") {
        i_caller = _caller;
    }

    modifier authorizedCaller() {
        if (msg.sender != i_caller) {
            revert BemaNFT__CurrentCallerNotAuthorized();
        }
        _;
    }

    function _tokenURI(uint256 tokenId) public view returns (BemaChain.Song memory) {
        return _tokenURIs[tokenId];
    }

    function setTokenURI(uint256 tokenId, BemaChain.Song memory _song) public {
        require(_exists(tokenId), "ERC721URIStorage: URI set of nonexistent token");
        _tokenURIs[tokenId] = _song;
    }

    function _MintNft(
        BemaChain.Song memory _song,
        address _songOwner
    ) public authorizedCaller returns (uint256) {
        uint256 currentId = Counters.current(s_tokenId);
        Counters.increment(s_tokenId);
        setTokenURI(currentId, _song);
        addressToIds[_songOwner].push(currentId);
        _safeMint(_songOwner, currentId);
        return currentId;
    }

    function deleteNft(uint256 _tokenId, address _songOwner) public authorizedCaller {
        for (uint i = 0; i < addressToIds[_songOwner].length; i++) {
            if (addressToIds[_songOwner][i] == _tokenId) {
                for (uint l = i; l < addressToIds[_songOwner].length - 1; l++) {
                    addressToIds[_songOwner][l] = addressToIds[_songOwner][l + 1];
                }
                addressToIds[_songOwner].pop();
                return;
            }
        }
        _burn(_tokenId);
    }

    function getTokensOwned(address _address) public view returns (uint256[] memory) {
        return addressToIds[_address];
    }

    function getTotalTokens() public view returns (uint256) {
        return Counters.current(s_tokenId);
    }
}
