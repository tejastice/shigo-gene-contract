// SPDX-License-Identifier: MIT
// Copyright (c) 2023 Keisuke OHNO

/*

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

*/

pragma solidity >=0.7.0 <0.9.0;

import "@openzeppelin/contracts/access/Ownable.sol";

interface iNFTCollection {
    function externalMint(address _address , uint256 _amount) external payable ;
    function externalBurn(uint256[] memory _burnTokenIds) external;
    function totalSupply() external view returns (uint256);
    function balanceOf(address address_) external view returns (uint256);
    function ownerOf(uint256 tokenId_) external view returns (address);
    function tokensOfOwner(address _address) external view returns (uint256[] memory);
}

contract testMinter is Ownable {

    iNFTCollection public NFTCollection = iNFTCollection(0x2d3C8D1A84cA778A3bba0F4fC389330AB96AF3Be); 
    constructor(){

    }


    modifier callerIsUser() {
        require(tx.origin == msg.sender, "The caller is another contract.");
        _;
    }
 
    function mint(uint256 _mintAmount ) public payable callerIsUser{
        NFTCollection.externalMint( msg.sender , _mintAmount );
    }

    function burn(uint256 _burnTokenId) public callerIsUser{
        require(msg.sender == NFTCollection.ownerOf(_burnTokenId) , "Owner is different");
        uint256[] memory _burnTokenIds = new uint[](1);
        _burnTokenIds[0] = _burnTokenId;
        NFTCollection.externalBurn( _burnTokenIds );
    }

    function burnAndMint(uint256 _burnTokenId ) public callerIsUser{
        require(msg.sender == NFTCollection.ownerOf(_burnTokenId) , "Owner is different");
        uint256[] memory _burnTokenIds = new uint[](1);
        _burnTokenIds[0] = _burnTokenId;
        NFTCollection.externalBurn( _burnTokenIds );
        NFTCollection.externalMint( msg.sender , 1 );
    }

    //onlyowner
    function setNFTCollection(address _address) public onlyOwner() {
        NFTCollection = iNFTCollection(_address);
    }

}