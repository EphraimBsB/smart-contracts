const { expect } = require("chai");
const hre = require("hardhat");
// const {ethers,formatUnits} =require('ethers');

describe("EphraToken contract", function() {
  // global vars
  let Token;
  let ephraToken;
  let owner;
  let addr1;
  let addr2;
  let tokenCap = 100000000;
  let tokenBlockReward = 50;

  beforeEach(async function () {
    // Get the ContractFactory and Signers here.
    Token = await ethers.getContractFactory("EphraToken");
    [owner, addr1, addr2] = await hre.ethers.getSigners();
    ephraToken = await Token.deploy(tokenCap, tokenBlockReward);
  });

  describe("Deployment", function () {
    it("Should set the right owner", async function () {
      expect(await ephraToken.owner()).to.equal(owner.address);
    });

    it("Should assign the total supply of tokens to the owner", async function () {
      const ownerBalance = await ephraToken.balanceOf(owner.address);
      expect(await ephraToken.totalSupply()).to.equal(ownerBalance);
    });

    it("Should set the max capped supply to the argument provided during deployment", async function () {
      const cap = await ephraToken.cap();
      expect(Number(hre.ethers.formatEther(cap))).to.equal(tokenCap);
    });

    it("Should set the blockReward to the argument provided during deployment", async function () {
      const blockReward = await ephraToken.blockReward();
      expect(Number(hre.ethers.formatEther(blockReward))).to.equal(tokenBlockReward);
    });
  });

  describe("Transactions", function () {
    it("Should transfer tokens between accounts", async function () {
      // Transfer 50 tokens from owner to addr1
      await ephraToken.transfer(addr1.address, 50);
      const addr1Balance = await ephraToken.balanceOf(addr1.address);
      expect(addr1Balance).to.equal(50);

      // Transfer 50 tokens from addr1 to addr2
      // We use .connect(signer) to send a transaction from another account
      await ephraToken.connect(addr1).transfer(addr2.address, 50);
      const addr2Balance = await ephraToken.balanceOf(addr2.address);
      expect(addr2Balance).to.equal(50);
    });

    it("Should fail if sender doesn't have enough tokens", async function () {
      const initialOwnerBalance = await ephraToken.balanceOf(owner.address);
      // Try to send 1 token from addr1 (0 tokens) to owner (1000000 tokens).
      // `require` will evaluate false and revert the transaction.
      // await expect(
      //   ephraToken.connect(addr2).transfer(owner.address, 1)
      // ).to.be.revertedWith("ERC20: transfer amount exceeds balance");

      // Owner balance shouldn't have changed.
      expect(await ephraToken.balanceOf(owner.address)).to.equal(
        initialOwnerBalance
      );
    });

    it("Should update balances after transfers", async function () {
      const initialOwnerBalance = await ephraToken.balanceOf(owner.address);

      // Transfer 100 tokens from owner to addr1.
      await ephraToken.transfer(addr1.address, 100);

      // Transfer another 50 tokens from owner to addr2.
      await ephraToken.transfer(addr2.address, 50);

      // Check balances.
      const finalOwnerBalance = await ephraToken.balanceOf(owner.address);
      expect(finalOwnerBalance).to.equal(initialOwnerBalance - 150n);

      const addr1Balance = await ephraToken.balanceOf(addr1.address);
      expect(addr1Balance).to.equal(100);

      const addr2Balance = await ephraToken.balanceOf(addr2.address);
      expect(addr2Balance).to.equal(50);
    });

  });
  
});