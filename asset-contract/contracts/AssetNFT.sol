// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract AssetNFT is ERC721, Ownable {
    uint256 public tokenCounter;

    // Pass the "owner" address to Ownable’s constructor
    constructor() ERC721("AssetNFT", "ANFT") Ownable(msg.sender) {
        tokenCounter = 0;
    }

    function mintAsset(address to) public onlyOwner returns (uint256) {
        tokenCounter++;
        uint256 newTokenId = tokenCounter;
        _safeMint(to, newTokenId);
        return newTokenId;
    }
}