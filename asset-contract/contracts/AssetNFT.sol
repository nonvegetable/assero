// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract AssetNFT is ERC721URIStorage {
    uint256 private _tokenIds;

    event AssetCreated(uint256 tokenId, address owner, string tokenURI);
    event AssetTransferred(uint256 tokenId, address from, address to);

    constructor() ERC721("AssetNFT", "ANFT") {}

    function createAsset(string memory tokenURI) public returns (uint256) {
        _tokenIds += 1;
        uint256 newTokenId = _tokenIds;

        _safeMint(msg.sender, newTokenId);
        _setTokenURI(newTokenId, tokenURI);

        emit AssetCreated(newTokenId, msg.sender, tokenURI);
        return newTokenId;
    }

    function transferAsset(address to, uint256 tokenId) public {
        // safeTransferFrom will revert if msg.sender is not owner or approved:
        safeTransferFrom(msg.sender, to, tokenId);
        emit AssetTransferred(tokenId, msg.sender, to);
    }

    function getAssetsByOwner(address owner) public view returns (uint256[] memory) {
        uint256 balance = balanceOf(owner);
        uint256[] memory tokens = new uint256[](balance);
        uint256 index = 0;

        for (uint256 i = 1; i <= _tokenIds; i++) {
            if (ownerOf(i) == owner) {
                tokens[index] = i;
                index++;
            }
        }
        return tokens;
    }
}