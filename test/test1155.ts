import { time, loadFixture } from "@nomicfoundation/hardhat-network-helpers"
import { anyValue } from "@nomicfoundation/hardhat-chai-matchers/withArgs"
import { expect } from "chai"
import { ethers } from "hardhat"
import { Signer } from "ethers"

import { MerkleTree} from 'merkletreejs';
import keccak256 from 'keccak256';
import { extendConfig } from "hardhat/config"



describe("Test of ERC1155", function () {


  const deploy = async (owner: Signer) => {
    const NFTContract = await ethers.getContractFactory("NFTContract1155")
    const dNFTContract = await NFTContract.connect(owner).deploy()
    return dNFTContract 
  }

  const Minterdeploy = async (owner: Signer) => {
    const MinterContract = await ethers.getContractFactory("testMinter")
    const dMinterContract = await MinterContract.connect(owner).deploy()
    return dMinterContract 
  }  

  async function fixture() {
    const [owner, otherAccount1 , otherAccount2] = await ethers.getSigners()
    const withdrawAddress = await ethers.getSigner(otherAccount1.address)
    const royaltyAddress = await ethers.getSigner(otherAccount1.address)
    const NFTContract = await deploy(owner)

    return { NFTContract, owner, otherAccount1 ,otherAccount2, withdrawAddress, royaltyAddress }
  }

  describe("Deployment", function () {
    it("address check", async function () {
      const { NFTContract , owner, otherAccount1 , otherAccount2 , withdrawAddress, royaltyAddress } = await loadFixture(fixture)
  
      expect(await NFTContract.owner()).to.equals(owner.address)
      await NFTContract.setWithdrawAddress(withdrawAddress.address);
      expect(await NFTContract.withdrawAddress()).to.equals(withdrawAddress.address)
      //expect(await NFTContract.baseURI()).to.equals(BASE_URI)
    })

    it("function test of setMerkleRoot", async function () {
      const { NFTContract , owner, otherAccount1 , otherAccount2 , withdrawAddress, royaltyAddress } = await loadFixture(fixture)
  
      const inputMerkleRoot = "0x1111111111222222222233333333334444444444555555555566666666667777";
      const ErrorMerkleRoot = "0x1111111111222222222233333333334444444444555555555566666666667770";
  
      await NFTContract.connect(owner).setMerkleRoot(inputMerkleRoot);
      let merkleRoot = await NFTContract.merkleRoot();
      expect(inputMerkleRoot).to.equal(merkleRoot);
      expect(ErrorMerkleRoot).to.not.equal(merkleRoot);
  
      await expect(NFTContract.connect(otherAccount1).setMerkleRoot(inputMerkleRoot)).reverted;
      await expect(NFTContract.connect(owner).setMerkleRoot(inputMerkleRoot)).not.reverted;
    });
  
    it("function test of setPause", async function () {
      const { NFTContract, owner, otherAccount1 , otherAccount2 , withdrawAddress, royaltyAddress } = await loadFixture(fixture)
  
      await NFTContract.connect(owner).setPause(true);
      let paused = await NFTContract.paused();
      expect(true).to.equal(paused);
      expect(false).to.not.equal(paused);
  
      await NFTContract.connect(owner).setPause(false);
      paused = await NFTContract.paused();
      expect(false).to.equal(paused);
      expect(true).to.not.equal(paused);
  
      await expect(NFTContract.connect(otherAccount1).setPause(true)).reverted;
      await expect(NFTContract.connect(owner).setPause(true)).not.reverted;
    });



    it("function test of getUserMintedAmount", async function () {
      const { NFTContract, owner, otherAccount1 , otherAccount2 , withdrawAddress, royaltyAddress } = await loadFixture(fixture)
  
      const phaseID = 1;
      const phaseID2 = 2;
      const inputMerkleProof = ["0x1111111111222222222233333333334444444444555555555566666666667777"];
  
      await NFTContract.connect(owner).setPause(false);
      await NFTContract.connect(owner).setOnlyAllowlisted(false);
      await NFTContract.connect(owner).setMintCount(true);
      await NFTContract.connect(owner).setPhaseId(phaseID);
      await NFTContract.connect(owner).setCost(0);
      await NFTContract.connect(owner).setMaxMintAmountPerTransaction(10);
      await NFTContract.connect(owner).setMaxSupply(100);
      

      let mintedAmount = await NFTContract.getUserMintedAmount(otherAccount1.address);
      expect(0).to.equal(mintedAmount);
  
      await NFTContract.connect(otherAccount1).mint(1,3,inputMerkleProof,1);
  
      mintedAmount = await NFTContract.getUserMintedAmount(otherAccount1.address);
      expect(1).to.equal(mintedAmount);
      expect(0).to.not.equal(mintedAmount);
  
      await NFTContract.connect(owner).setPhaseId(phaseID2);
      mintedAmount = await NFTContract.getUserMintedAmount(otherAccount1.address);
      expect(0).to.equal(mintedAmount);
  
    });

    
    it("function test of setSaleId", async function () {
      const { NFTContract , owner, otherAccount1 , otherAccount2 , withdrawAddress, royaltyAddress } = await loadFixture(fixture)
  
      await NFTContract.connect(owner).setPhaseId(1);
      let saleId = await NFTContract.phaseId();
      expect(1).to.equal(saleId);
      expect(0).to.not.equal(saleId);
  
      await NFTContract.connect(owner).setPhaseId(0);
      saleId = await NFTContract.phaseId();
      expect(0).to.equal(saleId);
      expect(1).to.not.equal(saleId);
  
      await expect(NFTContract.connect(otherAccount1).setPhaseId(1)).reverted;
      await expect(NFTContract.connect(owner).setPhaseId(1)).not.reverted;
    });

    it("function test of setMaxSupply", async function () {
      const { NFTContract , owner, otherAccount1 , otherAccount2 , withdrawAddress, royaltyAddress } = await loadFixture(fixture)
  
      await NFTContract.connect(owner).setMaxSupply(1000);
      let maxSupply = await NFTContract.maxSupply();
      expect(1000).to.equal(maxSupply);
      expect(0).to.not.equal(maxSupply);
  
      await NFTContract.connect(owner).setMaxSupply(1500);
      maxSupply = await NFTContract.maxSupply();
      expect(1500).to.equal(maxSupply);
      expect(1).to.not.equal(maxSupply);
  
      await expect(NFTContract.connect(otherAccount1).setMaxSupply(1)).reverted;
      await expect(NFTContract.connect(owner).setMaxSupply(1)).not.reverted;
    });
  

    it("function test of setPublicSaleMaxMintAmountPerAddress", async function () {
      const { NFTContract , owner, otherAccount1 , otherAccount2 , withdrawAddress, royaltyAddress } = await loadFixture(fixture)
  
      await NFTContract.connect(owner).setPublicSaleMaxMintAmountPerAddress(1000);
      let publicSaleMaxMintAmountPerAddress = await NFTContract.publicSaleMaxMintAmountPerAddress();
      expect(1000).to.equal(publicSaleMaxMintAmountPerAddress);
      expect(0).to.not.equal(publicSaleMaxMintAmountPerAddress);
  
      await NFTContract.connect(owner).setPublicSaleMaxMintAmountPerAddress(1500);
      publicSaleMaxMintAmountPerAddress = await NFTContract.publicSaleMaxMintAmountPerAddress();
      expect(1500).to.equal(publicSaleMaxMintAmountPerAddress);
      expect(1).to.not.equal(publicSaleMaxMintAmountPerAddress);
  
      await expect(NFTContract.connect(otherAccount1).setPublicSaleMaxMintAmountPerAddress(1)).reverted;
      await expect(NFTContract.connect(owner).setPublicSaleMaxMintAmountPerAddress(1)).not.reverted;
    });
  


    it("function test of setCost", async function () {
      const { NFTContract , owner, otherAccount1 , otherAccount2 , withdrawAddress, royaltyAddress } = await loadFixture(fixture)
  
      await NFTContract.connect(owner).setCost(1000);
      let cost = await NFTContract.cost();
      expect(1000).to.equal(cost);
      expect(0).to.not.equal(cost);
  
      await NFTContract.connect(owner).setCost(1500);
      cost = await NFTContract.cost();
      expect(1500).to.equal(cost);
      expect(1).to.not.equal(cost);
  
      await expect(NFTContract.connect(otherAccount1).setCost(1)).reverted;
      await expect(NFTContract.connect(owner).setCost(1)).not.reverted;
    });
  

    it("function test of setOnlyAllowlisted", async function () {
      const { NFTContract , owner, otherAccount1 , otherAccount2 , withdrawAddress, royaltyAddress } = await loadFixture(fixture)
  
      await NFTContract.connect(owner).setOnlyAllowlisted(true);
      let onlyAllowlisted = await NFTContract.onlyAllowlisted();
      expect(true).to.equal(onlyAllowlisted);
      expect(false).to.not.equal(onlyAllowlisted);
  
      await NFTContract.connect(owner).setOnlyAllowlisted(false);
      onlyAllowlisted = await NFTContract.onlyAllowlisted();
      expect(false).to.equal(onlyAllowlisted);
      expect(true).to.not.equal(onlyAllowlisted);
  
      await expect(NFTContract.connect(otherAccount1).setOnlyAllowlisted(true)).reverted;
      await expect(NFTContract.connect(owner).setOnlyAllowlisted(true)).not.reverted;
    });



    it("function test of setMaxMintAmountPerTransaction", async function () {
      const { NFTContract , owner, otherAccount1 , otherAccount2 , withdrawAddress, royaltyAddress } = await loadFixture(fixture)
  
      await NFTContract.connect(owner).setMaxMintAmountPerTransaction(1000);
      let maxMintAmountPerTransaction = await NFTContract.maxMintAmountPerTransaction();
      expect(1000).to.equal(maxMintAmountPerTransaction);
      expect(0).to.not.equal(maxMintAmountPerTransaction);
  
      await NFTContract.connect(owner).setMaxMintAmountPerTransaction(1500);
      maxMintAmountPerTransaction = await NFTContract.maxMintAmountPerTransaction();
      expect(1500).to.equal(maxMintAmountPerTransaction);
      expect(1).to.not.equal(maxMintAmountPerTransaction);
  
      await expect(NFTContract.connect(otherAccount1).setMaxMintAmountPerTransaction(1)).reverted;
      await expect(NFTContract.connect(owner).setMaxMintAmountPerTransaction(1)).not.reverted;
    });    


    it("function test of setMintCount", async function () {
      const { NFTContract , owner, otherAccount1 , otherAccount2 , withdrawAddress, royaltyAddress } = await loadFixture(fixture)
  
      await NFTContract.connect(owner).setMintCount(true);
      let mintCount = await NFTContract.mintCount();
      expect(true).to.equal(mintCount);
      expect(false).to.not.equal(mintCount);
  
      await NFTContract.connect(owner).setMintCount(false);
      mintCount = await NFTContract.mintCount();
      expect(false).to.equal(mintCount);
      expect(true).to.not.equal(mintCount);
  
      await expect(NFTContract.connect(otherAccount1).setMintCount(true)).reverted;
      await expect(NFTContract.connect(owner).setMintCount(true)).not.reverted;
    });




    it("function test of externalMint from wallet", async function () {
      const { NFTContract , owner, otherAccount1 , otherAccount2 , withdrawAddress, royaltyAddress } = await loadFixture(fixture)

      let MINTER = await NFTContract.MINTER_ROLE();

      await NFTContract.connect(owner).grantRole(MINTER,otherAccount1.address);

      await expect( NFTContract.connect(otherAccount2).externalMint(otherAccount1.address,1) ).reverted;
      await expect( NFTContract.connect(otherAccount1).externalMint(otherAccount1.address,1) ).not.reverted;
      await expect( NFTContract.connect(otherAccount1).externalMint(otherAccount2.address,1) ).not.reverted;

    });

    
    it("function test of externalMint from contract", async function () {
      const { NFTContract , owner, otherAccount1 , otherAccount2 , withdrawAddress, royaltyAddress } = await loadFixture(fixture)
      const MinterContract = await Minterdeploy(owner)

      let MINTER = await NFTContract.MINTER_ROLE();

      await expect( MinterContract.connect(otherAccount1).mint(2) ).reverted;
      await NFTContract.connect(owner).grantRole(MINTER,MinterContract.address);
      await MinterContract.connect(owner).setNFTCollection(NFTContract.address);
      await expect( MinterContract.connect(otherAccount1).mint(2) ).not.reverted;

    });





    
    it("function test of mint", async function () {
      const { NFTContract , owner, otherAccount1 , otherAccount2 , withdrawAddress, royaltyAddress } = await loadFixture(fixture)

      const [addr1, addr2 , addr3 , addr4 , addr5 , addr6] = await ethers.getSigners()
      const [amount1 , amount2 ,amount3 , amount4 , amount5] = [4,5,3,6,4];

      const allowlistAddresses = [
        [addr1.address,amount1],
        [addr2.address,amount2],
        [addr3.address,amount3],
        [addr4.address,amount4],
        [addr5.address,amount5],
      ]

      
      const leafNodes = allowlistAddresses.map(addr => ethers.utils.solidityKeccak256(['address', 'uint256'], [addr[0] , addr[1]]));
      const merkleTree = new MerkleTree(leafNodes, keccak256, { sortPairs: true});
      
      const rootHash = merkleTree.getRoot();
      //console.log('Whitelist Merkle Tree\n', merkleTree.toString());
      //console.log("Root Hash: ", "0x" + rootHash.toString('hex'));

      let merkleRoot = "0x" + rootHash.toString('hex');
      
      const nameMap = allowlistAddresses.map( list => list[0] );
      let addressId = nameMap.indexOf(allowlistAddresses[4][0]);
      const claimingAddress = ethers.utils.solidityKeccak256(['address', 'uint256'], [allowlistAddresses[addressId][0] , allowlistAddresses[addressId][1]]);
      
      //console.log("index : " , addressId);
      //console.log("address : " , allowlistAddresses[addressId][0]);
      //console.log("amount : " , allowlistAddresses[addressId][1]);
      //console.log("claimingAddress : " , claimingAddress);
      
      const hexProof = merkleTree.getHexProof(claimingAddress);
      //console.log("hexProof : \n",hexProof);
      
      //console.log(merkleTree.verify(hexProof, claimingAddress, rootHash));
      
      await NFTContract.connect(owner).setMerkleRoot(merkleRoot);

      await NFTContract.connect(owner).setMaxSupply(10);
      await NFTContract.connect(owner).setMaxMintAmountPerTransaction(5);


      //onlyAllowlisted: true
      //allowlistType = 0
      //mintCount: true 
      //mintWithSBT: false

      await NFTContract.connect(owner).setOnlyAllowlisted(true);
      await NFTContract.connect(owner).setMintCount(true);
      await NFTContract.connect(owner).setCost(1000000000000000);

      //pause check
      await NFTContract.connect(owner).setPause(true);
      await expect( NFTContract.connect(addr5).mint(1,amount5,hexProof,1,{ value: ethers.utils.parseEther("0.001") }) ).revertedWith("the contract is paused");
      await NFTContract.connect(owner).setPause(false);

      //cost check
      await expect( NFTContract.connect(addr5).mint(1,amount5,hexProof,1,{ value: 100 }) ).revertedWith("insufficient funds");
      await NFTContract.connect(owner).setCost(0);

      //mint amount check
      await expect( NFTContract.connect(addr5).mint(0,amount5,hexProof,1,{ value: ethers.utils.parseEther("0.001") }) ).revertedWith("need to mint at least 1 NFT");

      //maxMintAmountPerTransaction
      await expect( NFTContract.connect(addr5).mint(6,amount5,hexProof,1,{ value: ethers.utils.parseEther("0.006") }) ).revertedWith("max mint amount per session exceeded");

      //max supply
      await NFTContract.connect(owner).setMaxMintAmountPerTransaction(20);
      await expect( NFTContract.connect(addr5).mint(11,amount5,hexProof,1,{ value: ethers.utils.parseEther("0.011") }) ).revertedWith("max NFT limit exceeded");

      //max mint amount per address
      await expect( NFTContract.connect(addr5).mint(5,amount5,hexProof,1,{ value: ethers.utils.parseEther("0.005") }) ).revertedWith("max NFT per address exceeded");

      //uer is different
      await expect( NFTContract.connect(addr2).mint(2,amount5,hexProof,1,{ value: ethers.utils.parseEther("0.002") }) ).revertedWith("user is not allowlisted");

      //mint success 
      await expect( NFTContract.connect(addr5).mint(2,amount5,hexProof,1) ).not.reverted;



      await NFTContract.connect(owner).setOnlyAllowlisted(false);
      await NFTContract.connect(owner).setMintCount(true);
      
      await expect( NFTContract.connect(addr6).mint(1,amount5,hexProof,1,{ value: ethers.utils.parseEther("0.001") }) ).not.reverted;
      

    });


    it("max mint test", async function () {
      const { NFTContract , owner, otherAccount1 , otherAccount2 , withdrawAddress, royaltyAddress } = await loadFixture(fixture)
  
      await NFTContract.connect(owner).setMaxSupply(100);

      let maxSupply = await NFTContract.maxSupply();
      let totalSupply = await NFTContract.totalSupply();

      await expect(NFTContract.airdropMint([owner.address],[Number(maxSupply) + 1 - Number(totalSupply) ])).reverted;
      await expect(NFTContract.airdropMint([owner.address],[Number(maxSupply) + 0 - Number(totalSupply) ])).not.reverted;

    });



  })




})
