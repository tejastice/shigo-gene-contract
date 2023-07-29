import { time, loadFixture } from "@nomicfoundation/hardhat-network-helpers"
import { anyValue } from "@nomicfoundation/hardhat-chai-matchers/withArgs"
import { expect } from "chai"
import { ethers } from "hardhat"
import { Signer } from "ethers"

import { MerkleTree} from 'merkletreejs';
import keccak256 from 'keccak256';
import { extendConfig } from "hardhat/config"
import { sbtContractSol } from "../typechain-types/contracts"



describe("Test of ERC721", function () {

  const BASE_URI = "https://data.zqn.wtf/pixqn/metadata2/"

  const deploy = async (owner: Signer) => {
    const NFTContract = await ethers.getContractFactory("NFTContract721")
    const dNFTContract = await NFTContract.connect(owner).deploy()
    return dNFTContract 
  }
  const SBTdeploy = async (owner: Signer) => {
    const SBTContract = await ethers.getContractFactory("SBTContract")
    const dSBTContract = await SBTContract.connect(owner).deploy()
    return dSBTContract 
  }
  const Minterdeploy = async (owner: Signer) => {
    const MinterContract = await ethers.getContractFactory("testMinter")
    const dMinterContract = await MinterContract.connect(owner).deploy()
    return dMinterContract 
  }

  const pieMinterdeploy = async (owner: Signer) => {
    const pieMinterContract = await ethers.getContractFactory("pieMinter")
    const dpieMinterContract = await pieMinterContract.connect(owner).deploy()
    return dpieMinterContract 
  }

  const Sellerdeploy = async (owner: Signer) => {
    const SellerContract = await ethers.getContractFactory("NFTSellser")
    const dSellerContract = await SellerContract.connect(owner).deploy()
    return dSellerContract 
  }  

  async function fixture() {
    const [owner, otherAccount1 , otherAccount2] = await ethers.getSigners()
    const withdrawAddress = await ethers.getSigner(otherAccount1.address)
    const royaltyAddress = await ethers.getSigner(otherAccount1.address)
    const NFTContract = await deploy(owner)
    const SBTContract = await SBTdeploy(owner)

    return { NFTContract, SBTContract, owner, otherAccount1 ,otherAccount2, withdrawAddress, royaltyAddress }
  }

  describe("Deployment", function () {
    it("address check", async function () {
      const { NFTContract, SBTContract , owner, otherAccount1 , otherAccount2 , withdrawAddress, royaltyAddress } = await loadFixture(fixture)
  
      expect(await NFTContract.owner()).to.equals(owner.address)
      await NFTContract.setWithdrawAddress(withdrawAddress.address);
      expect(await NFTContract.withdrawAddress()).to.equals(withdrawAddress.address)
      //expect(await NFTContract.baseURI()).to.equals(BASE_URI)
    })

    it("function test of setMintWithSBT", async function () {
      const { NFTContract, SBTContract , owner, otherAccount1 , otherAccount2 , withdrawAddress, royaltyAddress } = await loadFixture(fixture)
  
      await NFTContract.connect(owner).setMintWithSBT(true);
      let mintWithSBT = await NFTContract.mintWithSBT();
      expect(true).to.equal(mintWithSBT);
      expect(false).to.not.equal(mintWithSBT);
  
      await NFTContract.connect(owner).setMintWithSBT(false);
      mintWithSBT = await NFTContract.mintWithSBT();
      expect(false).to.equal(mintWithSBT);
      expect(true).to.not.equal(mintWithSBT);
  
      await expect(NFTContract.connect(otherAccount1).setMintWithSBT(true)).reverted;
      await expect(NFTContract.connect(owner).setMintWithSBT(true)).not.reverted;
    });


    it("function test of setSbtCollection", async function () {
      const { NFTContract, SBTContract , owner, otherAccount1 , otherAccount2 , withdrawAddress, royaltyAddress } = await loadFixture(fixture)
  
      await NFTContract.connect(owner).setSbtCollection(SBTContract.address);
      let sbtCollection = await NFTContract.sbtCollection();
      expect(SBTContract.address).to.equal(sbtCollection);
  
      await expect(NFTContract.connect(otherAccount1).setSbtCollection(SBTContract.address)).reverted;
      await expect(NFTContract.connect(owner).setSbtCollection(SBTContract.address)).not.reverted;
    });


    it("function test of setBurnAndMintMode", async function () {
      const { NFTContract, SBTContract , owner, otherAccount1 , otherAccount2 , withdrawAddress, royaltyAddress } = await loadFixture(fixture)

      await NFTContract.connect(owner).setBurnAndMintMode(true);
      let burnAndMintMode = await NFTContract.burnAndMintMode();
      expect(true).to.equal(burnAndMintMode);
      expect(false).to.not.equal(burnAndMintMode);
      
      await NFTContract.connect(owner).setBurnAndMintMode(false);
      burnAndMintMode = await NFTContract.burnAndMintMode();
      expect(false).to.equal(burnAndMintMode);
      expect(true).to.not.equal(burnAndMintMode);

      await expect(NFTContract.connect(otherAccount1).setBurnAndMintMode(true)).reverted;
      await expect(NFTContract.connect(owner).setBurnAndMintMode(true)).not.reverted;
    });

    it("function test of setMerkleRoot", async function () {
      const { NFTContract, SBTContract , owner, otherAccount1 , otherAccount2 , withdrawAddress, royaltyAddress } = await loadFixture(fixture)
  
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
      const { NFTContract, SBTContract , owner, otherAccount1 , otherAccount2 , withdrawAddress, royaltyAddress } = await loadFixture(fixture)
  
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

    it("function test of setAllowListType", async function () {
      const { NFTContract, SBTContract , owner, otherAccount1 , otherAccount2 , withdrawAddress, royaltyAddress } = await loadFixture(fixture)
  
      await NFTContract.connect(owner).setAllowListType(1);
      let allowlistType = await NFTContract.allowlistType();
      expect(1).to.equal(allowlistType);
      expect(0).to.not.equal(allowlistType);
  
      await NFTContract.connect(owner).setAllowListType(0);
      allowlistType = await NFTContract.allowlistType();
      expect(0).to.equal(allowlistType);
      expect(1).to.not.equal(allowlistType);
  
      await expect(NFTContract.connect(otherAccount1).setAllowListType(1)).reverted;
      await expect(NFTContract.connect(owner).setAllowListType(1)).not.reverted;
      await expect(NFTContract.connect(owner).setAllowListType(2)).revertedWith("Allow list type error");
    });

    it("function test of setAllowlistMapping, getUserMintedAmountBySaleId, getUserMintedAmount", async function () {
      const { NFTContract, SBTContract , owner, otherAccount1 , otherAccount2 , withdrawAddress, royaltyAddress } = await loadFixture(fixture)
  
      const saleID = 2;
      const allowlistAddress = [otherAccount1.address , otherAccount2.address];
      const amount = [1,2];
  
      await NFTContract.connect(owner).setAllowlistMapping(saleID,allowlistAddress,amount);
      let ALamount = await NFTContract.allowlistUserAmount(saleID,otherAccount1.address);
      expect(1).to.equal(ALamount);
      expect(0).to.not.equal(ALamount);
  
      await expect(NFTContract.connect(otherAccount1).setAllowlistMapping(saleID,allowlistAddress,amount)).reverted;
      await expect(NFTContract.connect(owner).setAllowlistMapping(saleID,allowlistAddress,amount)).not.reverted;
  
      ALamount = await NFTContract.getAllowlistUserAmount(otherAccount1.address);
      expect(0).to.equal(ALamount);
  
      await NFTContract.setSaleId(saleID);
      ALamount = await NFTContract.getAllowlistUserAmount(otherAccount1.address);
      expect(1).to.equal(ALamount);
      expect(0).to.not.equal(ALamount);
  
    });

    it("function test of getUserMintedAmount", async function () {
      const { NFTContract, SBTContract , owner, otherAccount1 , otherAccount2 , withdrawAddress, royaltyAddress } = await loadFixture(fixture)
  
      const saleID = 0;
      const inputMerkleProof = ["0x1111111111222222222233333333334444444444555555555566666666667777"];
  
      await NFTContract.connect(owner).setPause(false);
      await NFTContract.connect(owner).setOnlyAllowlisted(false);
      await NFTContract.connect(owner).setMintCount(true);
      await NFTContract.connect(owner).setBurnAndMintMode(false);
      await NFTContract.connect(owner).setSaleId(saleID);
      await NFTContract.connect(owner).setMintWithSBT(false);
      await NFTContract.connect(owner).setCost(0);
      
      let mintedAmount = await NFTContract.getUserMintedAmount(otherAccount1.address);
      expect(0).to.equal(mintedAmount);
  
      await NFTContract.connect(otherAccount1).mint(1,10,inputMerkleProof,1);
  
      mintedAmount = await NFTContract.getUserMintedAmount(otherAccount1.address);
      expect(1).to.equal(mintedAmount);
      expect(0).to.not.equal(mintedAmount);
  
      await NFTContract.connect(owner).setSaleId(1);
      mintedAmount = await NFTContract.getUserMintedAmount(otherAccount1.address);
      expect(0).to.equal(mintedAmount);
  
    });

    
    it("function test of setSaleId", async function () {
      const { NFTContract, SBTContract , owner, otherAccount1 , otherAccount2 , withdrawAddress, royaltyAddress } = await loadFixture(fixture)
  
      await NFTContract.connect(owner).setSaleId(1);
      let saleId = await NFTContract.saleId();
      expect(1).to.equal(saleId);
      expect(0).to.not.equal(saleId);
  
      await NFTContract.connect(owner).setSaleId(0);
      saleId = await NFTContract.saleId();
      expect(0).to.equal(saleId);
      expect(1).to.not.equal(saleId);
  
      await expect(NFTContract.connect(otherAccount1).setSaleId(1)).reverted;
      await expect(NFTContract.connect(owner).setSaleId(1)).not.reverted;
    });

    it("function test of setMaxSupply", async function () {
      const { NFTContract, SBTContract , owner, otherAccount1 , otherAccount2 , withdrawAddress, royaltyAddress } = await loadFixture(fixture)
  
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
      const { NFTContract, SBTContract , owner, otherAccount1 , otherAccount2 , withdrawAddress, royaltyAddress } = await loadFixture(fixture)
  
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
      const { NFTContract, SBTContract , owner, otherAccount1 , otherAccount2 , withdrawAddress, royaltyAddress } = await loadFixture(fixture)
  
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
      const { NFTContract, SBTContract , owner, otherAccount1 , otherAccount2 , withdrawAddress, royaltyAddress } = await loadFixture(fixture)
  
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
      const { NFTContract, SBTContract , owner, otherAccount1 , otherAccount2 , withdrawAddress, royaltyAddress } = await loadFixture(fixture)
  
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
      const { NFTContract, SBTContract , owner, otherAccount1 , otherAccount2 , withdrawAddress, royaltyAddress } = await loadFixture(fixture)
  
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


    it("function test of setBaseURI", async function () {
      const { NFTContract, SBTContract , owner, otherAccount1 , otherAccount2 , withdrawAddress, royaltyAddress } = await loadFixture(fixture)
  
      let inputString = "base uri test";
      let errorString = "erorr base uri";

      await NFTContract.connect(owner).setBaseURI(inputString);
      let baseURI = await NFTContract.baseURI();
      expect(inputString).to.equal(baseURI);
      expect(errorString).to.not.equal(baseURI);
  
      await expect(NFTContract.connect(otherAccount1).setBaseURI(inputString)).reverted;
      await expect(NFTContract.connect(owner).setBaseURI(inputString)).not.reverted;
    });

    it("function test of setBaseExtension", async function () {
      const { NFTContract, SBTContract , owner, otherAccount1 , otherAccount2 , withdrawAddress, royaltyAddress } = await loadFixture(fixture)
  
      let inputString = "base extention test";
      let errorString = "erorr base extention";

      await NFTContract.connect(owner).setBaseExtension(inputString);
      let baseExtension = await NFTContract.baseExtension();
      expect(inputString).to.equal(baseExtension);
      expect(errorString).to.not.equal(baseExtension);
  
      await expect(NFTContract.connect(otherAccount1).setBaseExtension(inputString)).reverted;
      await expect(NFTContract.connect(owner).setBaseExtension(inputString)).not.reverted;
    });



    //ここに setInterfaceOfTokenURI のテストを書く



    it("function test of setUseInterfaceMetadata", async function () {
      const { NFTContract, SBTContract , owner, otherAccount1 , otherAccount2 , withdrawAddress, royaltyAddress } = await loadFixture(fixture)
  
      await NFTContract.connect(owner).setUseInterfaceMetadata(true);
      let useInterfaceMetadata = await NFTContract.useInterfaceMetadata();
      expect(true).to.equal(useInterfaceMetadata);
      expect(false).to.not.equal(useInterfaceMetadata);
  
      await NFTContract.connect(owner).setUseInterfaceMetadata(false);
      useInterfaceMetadata = await NFTContract.useInterfaceMetadata();
      expect(false).to.equal(useInterfaceMetadata);
      expect(true).to.not.equal(useInterfaceMetadata);
  
      await expect(NFTContract.connect(otherAccount1).setUseInterfaceMetadata(true)).reverted;
      await expect(NFTContract.connect(owner).setUseInterfaceMetadata(true)).not.reverted;
    });



    it("function test of setUseSingleMetadata", async function () {
      const { NFTContract, SBTContract , owner, otherAccount1 , otherAccount2 , withdrawAddress, royaltyAddress } = await loadFixture(fixture)
  
      await NFTContract.connect(owner).setUseSingleMetadata(true);
      let useSingleMetadata = await NFTContract.useSingleMetadata();
      expect(true).to.equal(useSingleMetadata);
      expect(false).to.not.equal(useSingleMetadata);
  
      await NFTContract.connect(owner).setUseSingleMetadata(false);
      useSingleMetadata = await NFTContract.useSingleMetadata();
      expect(false).to.equal(useSingleMetadata);
      expect(true).to.not.equal(useSingleMetadata);
  
      await expect(NFTContract.connect(otherAccount1).setUseSingleMetadata(true)).reverted;
      await expect(NFTContract.connect(owner).setUseSingleMetadata(true)).not.reverted;
    });


    it("function test of setMetadataTitle", async function () {
      const { NFTContract, SBTContract , owner, otherAccount1 , otherAccount2 , withdrawAddress, royaltyAddress } = await loadFixture(fixture)
  
      let inputString = "test string";
      let errorString = "erorr string";

      await NFTContract.connect(owner).setMetadataTitle(inputString);
      let metadataTitle = await NFTContract.metadataTitle();
      expect(inputString).to.equal(metadataTitle);
      expect(errorString).to.not.equal(metadataTitle);
  
      await expect(NFTContract.connect(otherAccount1).setMetadataTitle(inputString)).reverted;
      await expect(NFTContract.connect(owner).setMetadataTitle(inputString)).not.reverted;
    });

    it("function test of setMetadataDescription", async function () {
      const { NFTContract, SBTContract , owner, otherAccount1 , otherAccount2 , withdrawAddress, royaltyAddress } = await loadFixture(fixture)
  
      let inputString = "test string";
      let errorString = "erorr string";

      await NFTContract.connect(owner).setMetadataDescription(inputString);
      let checkString = await NFTContract.metadataDescription();
      expect(inputString).to.equal(checkString);
      expect(errorString).to.not.equal(checkString);
  
      await expect(NFTContract.connect(otherAccount1).setMetadataDescription(inputString)).reverted;
      await expect(NFTContract.connect(owner).setMetadataDescription(inputString)).not.reverted;
    });


    it("function test of setMetadataAttributes", async function () {
      const { NFTContract, SBTContract , owner, otherAccount1 , otherAccount2 , withdrawAddress, royaltyAddress } = await loadFixture(fixture)
  
      let inputString = "test string";
      let errorString = "erorr string";

      await NFTContract.connect(owner).setMetadataAttributes(inputString);
      let checkString = await NFTContract.metadataAttributes();
      expect(inputString).to.equal(checkString);
      expect(errorString).to.not.equal(checkString);
  
      await expect(NFTContract.connect(otherAccount1).setMetadataAttributes(inputString)).reverted;
      await expect(NFTContract.connect(owner).setMetadataAttributes(inputString)).not.reverted;
    });

    it("function test of setImageURI", async function () {
      const { NFTContract, SBTContract , owner, otherAccount1 , otherAccount2 , withdrawAddress, royaltyAddress } = await loadFixture(fixture)
  
      let inputString = "test string";
      let errorString = "erorr string";

      await NFTContract.connect(owner).setImageURI(inputString);
      let checkString = await NFTContract.imageURI();
      expect(inputString).to.equal(checkString);
      expect(errorString).to.not.equal(checkString);
  
      await expect(NFTContract.connect(otherAccount1).setImageURI(inputString)).reverted;
      await expect(NFTContract.connect(owner).setImageURI(inputString)).not.reverted;
    });


    it("function test of setUseAnimationUrl", async function () {
      const { NFTContract, SBTContract , owner, otherAccount1 , otherAccount2 , withdrawAddress, royaltyAddress } = await loadFixture(fixture)
  
      await NFTContract.connect(owner).setUseAnimationUrl(true);
      let checkBool = await NFTContract.useAnimationUrl();
      expect(true).to.equal(checkBool);
      expect(false).to.not.equal(checkBool);
  
      await NFTContract.connect(owner).setUseAnimationUrl(false);
      checkBool = await NFTContract.useAnimationUrl();
      expect(false).to.equal(checkBool);
      expect(true).to.not.equal(checkBool);
  
      await expect(NFTContract.connect(otherAccount1).setUseAnimationUrl(true)).reverted;
      await expect(NFTContract.connect(owner).setUseAnimationUrl(true)).not.reverted;
    });


    it("function test of setAnimationURI", async function () {
      const { NFTContract, SBTContract , owner, otherAccount1 , otherAccount2 , withdrawAddress, royaltyAddress } = await loadFixture(fixture)
  
      let inputString = "test string";
      let errorString = "erorr string";

      await NFTContract.connect(owner).setAnimationURI(inputString);
      let checkString = await NFTContract.animationURI();
      expect(inputString).to.equal(checkString);
      expect(errorString).to.not.equal(checkString);
  
      await expect(NFTContract.connect(otherAccount1).setAnimationURI(inputString)).reverted;
      await expect(NFTContract.connect(owner).setAnimationURI(inputString)).not.reverted;
    });


    it("function test of setUseAnimationUrl", async function () {
      const { NFTContract, SBTContract , owner, otherAccount1 , otherAccount2 , withdrawAddress, royaltyAddress } = await loadFixture(fixture)
  
      await NFTContract.connect(owner).setIsSBT(true);
      let checkBool = await NFTContract.isSBT();
      expect(true).to.equal(checkBool);
      expect(false).to.not.equal(checkBool);
  
      await NFTContract.connect(owner).setIsSBT(false);
      checkBool = await NFTContract.isSBT();
      expect(false).to.equal(checkBool);
      expect(true).to.not.equal(checkBool);
  
      await expect(NFTContract.connect(otherAccount1).setIsSBT(true)).reverted;
      await expect(NFTContract.connect(owner).setIsSBT(true)).not.reverted;
    });


    it("function test of setEnebleRestrict", async function () {
      const { NFTContract, SBTContract , owner, otherAccount1 , otherAccount2 , withdrawAddress, royaltyAddress } = await loadFixture(fixture)
  
      await NFTContract.connect(owner).setEnebleRestrict(true);
      let checkBool = await NFTContract.enableRestrict();
      expect(true).to.equal(checkBool);
      expect(false).to.not.equal(checkBool);
  
      await NFTContract.connect(owner).setEnebleRestrict(false);
      checkBool = await NFTContract.enableRestrict();
      expect(false).to.equal(checkBool);
      expect(true).to.not.equal(checkBool);
  
      await expect(NFTContract.connect(otherAccount1).setEnebleRestrict(true)).reverted;
      await expect(NFTContract.connect(owner).setEnebleRestrict(true)).not.reverted;
    });


    it("function test of externalMint and externalBurn from wallet", async function () {
      const { NFTContract, SBTContract , owner, otherAccount1 , otherAccount2 , withdrawAddress, royaltyAddress } = await loadFixture(fixture)

      let MINTER = await NFTContract.MINTER_ROLE();
      let BURNER = await NFTContract.BURNER_ROLE();

      await NFTContract.connect(owner).grantRole(MINTER,otherAccount1.address);
      await NFTContract.connect(owner).grantRole(BURNER,otherAccount1.address);

      await expect( NFTContract.connect(otherAccount2).externalMint(otherAccount1.address,1) ).reverted;
      await expect( NFTContract.connect(otherAccount1).externalMint(otherAccount1.address,1) ).not.reverted;
      await expect( NFTContract.connect(otherAccount1).externalMint(otherAccount2.address,1) ).not.reverted;

      //let currentId = await NFTContract.
      let tokenIds1 = await NFTContract.tokensOfOwner(otherAccount1.address);
      let tokenIds2 = await NFTContract.tokensOfOwner(otherAccount2.address);
      
      let checkAddress = await NFTContract.ownerOf(tokenIds1[tokenIds1.length-1]);
      let checkAmount = await NFTContract.balanceOf(otherAccount1.address);

      expect(otherAccount1.address).to.equal(checkAddress);
      expect(otherAccount2.address).to.not.equal(checkAddress);
      expect(1).to.equal(checkAmount);
  
      await expect(NFTContract.connect(otherAccount2).externalBurn([tokenIds1[tokenIds1.length-1]])).reverted;
      await expect(NFTContract.connect(otherAccount1).externalBurn([tokenIds2[tokenIds1.length-1]])).reverted;
      await expect(NFTContract.connect(otherAccount1).externalBurn([tokenIds1[tokenIds1.length-1]])).not.reverted;

    });

    it("function test of externalMint and externalBurn from contract", async function () {
      const { NFTContract, SBTContract , owner, otherAccount1 , otherAccount2 , withdrawAddress, royaltyAddress } = await loadFixture(fixture)
      const MinterContract = await Minterdeploy(owner)

      let MINTER = await NFTContract.MINTER_ROLE();
      let BURNER = await NFTContract.BURNER_ROLE();

      let supply1 = await NFTContract.totalSupply();

      await expect( MinterContract.connect(otherAccount1).mint(2) ).reverted;
      await NFTContract.connect(owner).grantRole(MINTER,MinterContract.address);
      await MinterContract.connect(owner).setNFTCollection(NFTContract.address);
      await expect( MinterContract.connect(otherAccount1).mint(2) ).not.reverted;

      let supply2 = await NFTContract.totalSupply();

      let tokenIds1 = await NFTContract.tokensOfOwner(otherAccount1.address);

      await expect(MinterContract.connect(otherAccount1).burn(tokenIds1[tokenIds1.length-1])).reverted;
      await NFTContract.connect(owner).grantRole(BURNER,MinterContract.address);
      await expect(MinterContract.connect(otherAccount1).burn(tokenIds1[tokenIds1.length-1])).not.reverted;

      let supply3 = await NFTContract.totalSupply();

      tokenIds1 = await NFTContract.tokensOfOwner(otherAccount1.address);
      let tokenIDBefore = await NFTContract.tokensOfOwner(otherAccount1.address);
      await expect(MinterContract.connect(otherAccount1).burnAndMint(tokenIds1[tokenIds1.length-1])).not.reverted;
      let tokenIDAfter = await NFTContract.tokensOfOwner(otherAccount1.address);

      let supply4 = await NFTContract.totalSupply();

      expect(supply1).not.to.equal(supply2);
      expect(supply2).not.to.equal(supply3);
      expect(supply3).to.equal(supply4);

      expect(tokenIDBefore[tokenIDBefore.length-1]).not.to.equal(tokenIDAfter[tokenIDAfter.length-1]);

    });

    it("SBT transfer check", async function () {
      const { NFTContract, SBTContract , owner, otherAccount1 , otherAccount2 , withdrawAddress, royaltyAddress } = await loadFixture(fixture)
  
      let tokens = await SBTContract.tokensOfOwner(owner.address);
      await expect(SBTContract.connect(owner).transferFrom(owner.address,otherAccount1.address,tokens[0])).reverted;

      await SBTContract.connect(owner).setIsSBT(false);
      await SBTContract.connect(owner).setUseTimeRelease(true);
      await SBTContract.connect(owner).setTimeReleaseStamp(99999999999999);
      await expect(SBTContract.connect(owner).transferFrom(owner.address,otherAccount1.address,tokens[0])).reverted;

      await SBTContract.connect(owner).setTimeReleaseStamp(1);
      await expect(SBTContract.connect(owner).transferFrom(owner.address,otherAccount1.address,tokens[0])).not.reverted;

    });

    
    it("function test of mint", async function () {
      const { NFTContract, SBTContract , owner, otherAccount1 , otherAccount2 , withdrawAddress, royaltyAddress } = await loadFixture(fixture)

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


      let CurrentTokenId2 = await NFTContract.currentTokenId();

      await NFTContract.connect(owner).setMaxSupply(Number(CurrentTokenId2)+10);
      await NFTContract.connect(owner).setMaxMintAmountPerTransaction(5);


      //onlyAllowlisted: true
      //allowlistType = 0
      //mintCount: true 
      //mintWithSBT: false

      await NFTContract.connect(owner).setOnlyAllowlisted(true);
      await NFTContract.connect(owner).setAllowListType(0);
      await NFTContract.connect(owner).setMintCount(true);
      await NFTContract.connect(owner).setMintWithSBT(false);

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


      //onlyAllowlisted: true
      //allowlistType = 0
      //mintCount: true 
      //mintWithSBT: true

      await NFTContract.connect(owner).setOnlyAllowlisted(true);
      await NFTContract.connect(owner).setAllowListType(0);
      await NFTContract.connect(owner).setMintCount(true);
      await NFTContract.connect(owner).setMintWithSBT(true);

      let MINTER = await SBTContract.MINTER_ROLE();
      await SBTContract.connect(owner).grantRole(MINTER,NFTContract.address);

      //sbt address is null

      await expect( NFTContract.connect(addr6).mint(1,amount5,hexProof,1,{ value: ethers.utils.parseEther("0.001") }) ).reverted;
      await NFTContract.connect(owner).setSbtCollection(SBTContract.address);

      let balance1 = await SBTContract.balanceOf(addr5.address);
      await expect( NFTContract.connect(addr5).mint(1,amount5,hexProof,1) ).not.reverted;
      let balance2 = await SBTContract.balanceOf(addr5.address);

      expect(balance1).to.equal(0);
      expect(balance2).to.equal(1);



      await NFTContract.connect(owner).setOnlyAllowlisted(false);
      await NFTContract.connect(owner).setAllowListType(0);
      await NFTContract.connect(owner).setMintCount(true);
      await NFTContract.connect(owner).setMintWithSBT(true);
      
      await expect( NFTContract.connect(addr6).mint(1,amount5,hexProof,1,{ value: ethers.utils.parseEther("0.001") }) ).not.reverted;
      



      await NFTContract.connect(owner).setSaleId(1);
      await NFTContract.connect(owner).setOnlyAllowlisted(true);
      await NFTContract.connect(owner).setAllowListType(1);
      await NFTContract.connect(owner).setMintCount(true);
      await NFTContract.connect(owner).setMintWithSBT(true);

      await expect( NFTContract.connect(addr6).mint(1,amount5,hexProof,1) ).reverted;
      await NFTContract.connect(owner).setAllowlistMapping(1,[addr6.address],[1]);
      await expect( NFTContract.connect(addr6).mint(1,amount5,hexProof,1,{ value: ethers.utils.parseEther("0.001") }) ).not.reverted;
      await expect( NFTContract.connect(addr6).mint(1,amount5,hexProof,1,{ value: ethers.utils.parseEther("0.001") }) ).revertedWith("max NFT per address exceeded");
      



      await NFTContract.connect(owner).setSaleId(1);
      await NFTContract.connect(owner).setOnlyAllowlisted(true);
      await NFTContract.connect(owner).setAllowListType(1);
      await NFTContract.connect(owner).setMintCount(false);
      await NFTContract.connect(owner).setMintWithSBT(true);

      await expect( NFTContract.connect(addr6).mint(1,amount5,hexProof,1,{ value: ethers.utils.parseEther("0.001") }) ).not.reverted;



      await NFTContract.connect(owner).setOnlyAllowlisted(false);
      await NFTContract.connect(owner).setAllowListType(1);
      await NFTContract.connect(owner).setMintCount(false);
      await NFTContract.connect(owner).setMintWithSBT(false);

      let currentTokenId = await NFTContract.currentTokenId();
      let maxSupply = await NFTContract.maxSupply();

      await expect( NFTContract.connect(addr6).mint(Number(maxSupply)-Number(currentTokenId),amount5,hexProof,1) ).not.reverted;

      currentTokenId = await NFTContract.currentTokenId();
      maxSupply = await NFTContract.maxSupply();


      //上限まで発行
      expect(maxSupply).to.equal(currentTokenId);

      //オーバー使用とするとエラー
      await expect( NFTContract.connect(addr6).mint(1,amount5,hexProof,1,{ value: ethers.utils.parseEther("0.001") }) ).reverted;

      await NFTContract.connect(owner).setMaxSupply(Number(maxSupply)+1);
      await expect( NFTContract.connect(addr6).mint(1,amount5,hexProof,1,{ value: ethers.utils.parseEther("0.001") }) ).not.reverted;

      //bur nin
      await NFTContract.connect(owner).setBurnAndMintMode(true);
      maxSupply = await NFTContract.maxSupply();
      await NFTContract.connect(owner).setMaxSupply(Number(maxSupply)+1);

      let totalSupply1 = await NFTContract.totalSupply();
      let tokenIds = await NFTContract.tokensOfOwner(addr6.address);
      let currentTokenId1 = await NFTContract.currentTokenId();

      let address1 = await NFTContract.ownerOf(currentTokenId1);
      expect(address1).to.equal(addr6.address);


      //自分が持っていないtokenidはreverte
      await expect( NFTContract.connect(addr6).mint(1,amount5,hexProof,0,{ value: ethers.utils.parseEther("0.001") }) ).reverted;

      //自分が持っているtokenidは通る
      await expect( NFTContract.connect(addr6).mint(1,amount5,hexProof,tokenIds[tokenIds.length-1],{ value: ethers.utils.parseEther("0.001") }) ).not.reverted;

      let totalSupply2 = await NFTContract.totalSupply();
      let currentTokenId2 = await NFTContract.currentTokenId();

      expect(totalSupply1).to.equal(totalSupply2);
      expect(Number(currentTokenId1)+1).to.equal(currentTokenId2);


      await expect( NFTContract.ownerOf(currentTokenId1) ).reverted;
      let address2 = await NFTContract.ownerOf(currentTokenId2);
      expect(address2).to.equal(addr6.address);

    });

    it("max mint test", async function () {
      const { NFTContract, SBTContract , owner, otherAccount1 , otherAccount2 , withdrawAddress, royaltyAddress } = await loadFixture(fixture)
  
      let maxSupply = await NFTContract.maxSupply();
      let totalSupply = await NFTContract.totalSupply();

      while(1){
        maxSupply = await NFTContract.maxSupply();
        totalSupply = await NFTContract.totalSupply();

        if( Number(maxSupply) - Number(totalSupply) < 500 ){
          break;
        }

        await NFTContract.airdropMint([owner.address],[500]);

      }

      await expect(NFTContract.airdropMint([owner.address],[Number(maxSupply) + 2 - Number(totalSupply) ])).reverted;
      await expect(NFTContract.airdropMint([owner.address],[Number(maxSupply) + 1 - Number(totalSupply) ])).not.reverted;

    });


    it("function test of pieMint", async function () {
      const { NFTContract, SBTContract , owner, otherAccount1 , otherAccount2 , withdrawAddress, royaltyAddress } = await loadFixture(fixture)
      const pieMinterContract = await pieMinterdeploy(owner)

      let MINTER = await NFTContract.MINTER_ROLE();

      await expect( pieMinterContract.connect(otherAccount1).mint(2 , otherAccount1.address) ).reverted;

      await NFTContract.connect(owner).grantRole(MINTER,pieMinterContract.address);
      await pieMinterContract.connect(owner).setNFTCollection(NFTContract.address);
      await pieMinterContract.connect(owner).grantRole(MINTER , otherAccount1.address);
      await pieMinterContract.connect(owner).setWithdrawAddress(otherAccount2.address);
      await pieMinterContract.connect(owner).setCost(1000000000000000);
      await expect( pieMinterContract.connect(otherAccount1).mint(2 , otherAccount1.address) ).revertedWith("the contract is paused");

      await pieMinterContract.connect(owner).setPause(false);
      await expect( pieMinterContract.connect(otherAccount1).mint(2 , otherAccount1.address) ).revertedWith("insufficient funds");

      await expect( pieMinterContract.connect(otherAccount1).mint(0 , otherAccount1.address , { value: ethers.utils.parseEther("0.001") } )  ).revertedWith("need to mint at least 1 NFT");

      console.log( await otherAccount2.getBalance())
      await expect( pieMinterContract.connect(otherAccount1).mint(2 , otherAccount1.address , { value: ethers.utils.parseEther("0.002") } )  ).not.reverted;
      console.log( await otherAccount2.getBalance())

      
    });


    it("Seller test", async function () {
      const { NFTContract, SBTContract , owner, otherAccount1 , otherAccount2 , withdrawAddress, royaltyAddress } = await loadFixture(fixture)
      const SellerContract = await Sellerdeploy(owner)
  
      let currentTokenId =  Number(await NFTContract.connect(owner).currentTokenId()) ;
      await NFTContract.connect(owner).airdropMint([otherAccount1.address],[5] );



      const [addr1, addr2 , addr3 , addr4 , addr5 ] = await ethers.getSigners()
      const [tokenId1 , tokenId2 ,tokenId3 , tokenId4 , tokenId5] = [
        currentTokenId+1,
        currentTokenId+2,
        currentTokenId+3,
        currentTokenId+4,
        currentTokenId+5
      ];


      const allowlistAddresses = [
        [addr1.address,tokenId1],
        [addr2.address,tokenId2],
        [addr3.address,tokenId3],
        [addr4.address,tokenId4],
        [addr5.address,tokenId5],
      ]


      const leafNodes = allowlistAddresses.map(addr => ethers.utils.solidityKeccak256(['address', 'uint256'], [addr[0] , addr[1]]));
      const merkleTree = new MerkleTree(leafNodes, keccak256, { sortPairs: true});
      
      const rootHash = merkleTree.getRoot();

      let merkleRoot = "0x" + rootHash.toString('hex');
      
      const nameMap = allowlistAddresses.map( list => list[0] );
      let addressId = nameMap.indexOf(allowlistAddresses[4][0]);
      const claimingAddress = ethers.utils.solidityKeccak256(['address', 'uint256'], [allowlistAddresses[addressId][0] , allowlistAddresses[addressId][1]]);

      const hexProof = merkleTree.getHexProof(claimingAddress);
      
      //await SellerContract.connect(owner).setMerkleRoot(merkleRoot);
      //await SellerContract.connect(owner).setNFTCollection(NFTContract.address);
      //await SellerContract.connect(owner).setSellserWalletAddress(otherAccount1.address);

      await expect(SellerContract.connect(owner).setSaleData( 5000000000000000 ,merkleRoot , otherAccount1.address , NFTContract.address) ).not.reverted;

      //全部エラー
      await expect( SellerContract.connect(addr5).buy(tokenId5,hexProof,{ value: ethers.utils.parseEther("0.001") }) ).revertedWith("the contract is paused");
      await SellerContract.connect(owner).setPause(false);
      await expect( SellerContract.connect(addr5).buy(tokenId5,hexProof,{ value: ethers.utils.parseEther("0") }) ).revertedWith("insufficient funds");
      await expect( SellerContract.connect(addr5).buy(0,hexProof,{ value: ethers.utils.parseEther("1") }) ).revertedWith("NFT out of stock");
      await expect( SellerContract.connect(addr5).buy(tokenId4,hexProof,{ value: ethers.utils.parseEther("1") }) ).revertedWith("user is not allowlisted");
      await expect( SellerContract.connect(addr5).buy(tokenId5,hexProof,{ value: ethers.utils.parseEther("1") }) ).reverted;

      await NFTContract.connect(owner).addLocalContractAllowList(SellerContract.address);
      await NFTContract.connect(otherAccount1).setApprovalForAll(SellerContract.address,true);

      //成功！
      await expect( SellerContract.connect(addr5).buy(tokenId5,hexProof,{ value: ethers.utils.parseEther("1") }) ).not.reverted;

    });





  })




})
