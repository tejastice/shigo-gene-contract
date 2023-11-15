// SPDX-License-Identifier: MIT
// Copyright (c) 2023 Keisuke OHNO (kei31.eth)

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
import "@openzeppelin/contracts/utils/cryptography/MerkleProof.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";


//NFT interface
interface iNFTCollection {
    function balanceOf(address _owner) external view returns (uint);
    function ownerOf(uint256 tokenId) external view returns (address);
    function safeTransferFrom( address from, address to, uint256 tokenId) external ;
}

contract NFTSellserPublic is Ownable , AccessControl{

    constructor() {
        _setupRole(DEFAULT_ADMIN_ROLE, msg.sender);
        grantRole( ADMIN             , msg.sender);

        setSellserWalletAddress(0x4414F1abf9E4a97EEF93e1F0ab96C2C1FD88f86c);
        setNFTCollection(0x597D757f8502F1fe8E7dD6fc7FE884A51C5Ae2b9);

    }

    bytes32 public constant ADMIN = keccak256("ADMIN");
    bytes32 public constant MINTER_ROLE  = keccak256("MINTER_ROLE");


    //
    //withdraw section
    //

    address public withdrawAddress = 0xdEcf4B112d4120B6998e5020a6B4819E490F7db6;

    function setWithdrawAddress(address _withdrawAddress) public onlyOwner {
        withdrawAddress = _withdrawAddress;
    }

    function withdraw() public payable onlyOwner {
        (bool os, ) = payable(withdrawAddress).call{value: address(this).balance}('');
        require(os);
    }


    //
    //buy section
    //

    bool public paused = true;
    uint256 public cost = 390000000000000000;
    address public sellerWalletAddress = 0xdEcf4B112d4120B6998e5020a6B4819E490F7db6;

    uint256 public saleNumber;
    uint256[] public saleTokenIds;

    //https://eth-converter.com/

    iNFTCollection public NFTCollection;

    modifier callerIsUser() {
        require(tx.origin == msg.sender, "The caller is another contract.");
        _;
    }

    function buy() public payable callerIsUser{
        require( !paused, "the contract is paused");
        require( cost  <= msg.value, "insufficient funds");
        require( saleNumber < saleTokenIds.length , "out of stock");
        require( NFTCollection.ownerOf( saleTokenIds[saleNumber] ) == sellerWalletAddress , "NFT out of stock");

        NFTCollection.safeTransferFrom( sellerWalletAddress , msg.sender , saleTokenIds[saleNumber] );
        saleNumber += 1;

        (bool os, ) = payable(withdrawAddress).call{value: address(this).balance}('');
        require(os);

    }

    function buyPie(address receiver) public payable callerIsUser onlyRole(MINTER_ROLE){
        require(!paused, "the contract is paused");
        require(cost  <= msg.value, "insufficient funds");
        require( saleNumber < saleTokenIds.length , "out of stock");
        require( NFTCollection.ownerOf( saleTokenIds[saleNumber] ) == sellerWalletAddress , "NFT out of stock");

        NFTCollection.safeTransferFrom( sellerWalletAddress , receiver , saleTokenIds[saleNumber] );
        saleNumber += 1;

        (bool os, ) = payable(withdrawAddress).call{value: address(this).balance}('');
        require(os);
    }

    function setPause(bool _state) public onlyRole(ADMIN) {
        paused = _state;
    }

    function setCost(uint256 _newCost) public onlyRole(ADMIN) {
        cost = _newCost;
    }

    function setSaleTokenIds(uint256[] memory _tokenIds ) public onlyRole(ADMIN){
        saleTokenIds = _tokenIds;
        saleNumber = 0;
    }

    function getSaleTokenIds() public view returns (uint256[] memory){
        return saleTokenIds;
    }

    function setSellserWalletAddress(address _sellerWalletAddress) public onlyRole(ADMIN)  {
        sellerWalletAddress = _sellerWalletAddress;
    }

    function setNFTCollection(address _address) public onlyRole(ADMIN) {
        NFTCollection = iNFTCollection(_address);
    }

    function setSaleData(
        uint256 _newCost,
        address _sellerWalletAddress,
        address _collectionAddress
    ) public onlyRole(ADMIN){
        setCost(_newCost);
        setSellserWalletAddress(_sellerWalletAddress);
        setNFTCollection(_collectionAddress);
    }

    function nftOwnerOf(uint256 _tokenId)public view returns(address){
        return NFTCollection.ownerOf(_tokenId);
    }

    function NFTinStock(uint256 _tokenId)public view returns(bool){
        if( NFTCollection.ownerOf(_tokenId) == sellerWalletAddress ){
            return true;
        }else{
            return false;
        }
    }

    function nftTokensOfOwner(address _address) public view returns (uint256[] memory) {
        unchecked {
            uint256 tokenIdsIdx;
            uint256 tokenIdsLength = NFTCollection.balanceOf(_address);
            uint256[] memory tokenIds = new uint256[](tokenIdsLength);
            for (uint256 i = 0; tokenIdsIdx != tokenIdsLength; ++i) {
                try NFTCollection.ownerOf(i) {
                    if (NFTCollection.ownerOf(i) == _address) {
                        tokenIds[tokenIdsIdx++] = i;
                    }
                } catch {
                    // nothing
                }
            }
            return tokenIds;   
        }
    }
    

}
       