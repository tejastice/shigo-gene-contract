// SPDX-License-Identifier: MIT
// Copyright (c) 2022 Keisuke OHNO

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

import { Base64 } from 'base64-sol/base64.sol';
import "@openzeppelin/contracts/access/Ownable.sol";


contract onchainTokenURI is Ownable{

    constructor(){
        setMetadataTitle("title");
        setMetadataDescription("description");
        setMetadataAttributes("attribute");
        setImageData(" ");
    }

    string public metadataTitle;
    string public metadataDescription;
    string public metadataAttributes;
    string public imageData;
    string public dataType;

    //single image metadata
    function setMetadataTitle(string memory _metadataTitle) public onlyOwner {
        metadataTitle = _metadataTitle;
    }
    function setMetadataDescription(string memory _metadataDescription) public onlyOwner {
        metadataDescription = _metadataDescription;
    }
    function setMetadataAttributes(string memory _metadataAttributes) public onlyOwner {
        metadataAttributes = _metadataAttributes;
    }
    function setImageData(string memory _imageData) public onlyOwner {
        imageData = _imageData;
    }

    //public
    function tokenURI(uint256 /*tokenId*/) public view returns (string memory) {
        return string( abi.encodePacked( 'data:application/json;utf8,' , 
                '{',
                    '"name":"' , metadataTitle ,'",' ,
                    '"description":"' , metadataDescription ,  '",' ,
                    '"image": "' , imageData , '",' ,
                    '"attributes":[{"trait_type":"type","value":"' , metadataAttributes , '"}]',
                '}'
        ) );
    }


}