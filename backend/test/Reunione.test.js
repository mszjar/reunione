const {
  time,
  loadFixture,
} = require("@nomicfoundation/hardhat-toolbox/network-helpers");
const { assert, expect } = require("chai");
const { ethers } = require("hardhat");

describe("Reunione", function () {
  let owner;
  let addr1;
  let addr2;
  let addr3;
  let reunione;

  async function deployReunione() {
    const [owner, addr1, addr2, addr3] = await ethers.getSigners();
    const Reunione = await ethers.getContractFactory("Reunione");
    const reunione = await Reunione.deploy();

    return { reunione, owner, addr1, addr2, addr3 };
  }

  async function deployReunioneAndCreateClub() {
    const { reunione, owner, addr1, addr2, addr3 } = await deployReunione();
    const title = "Blockchain Club";
    const description = "A club for blockchain enthusiasts";
    const duration = 365 * 24 * 60 * 60; // 1 year
    const subscriptionPrice = ethers.parseEther("1");
    const image = "ipfs://imagehash";
    await reunione.createClub(title, description, duration, subscriptionPrice, image);

    return { reunione, owner, addr1, addr2, addr3 };
  }

  describe('Deployment', function() {
    beforeEach(async function() {
      const fixture = await loadFixture(deployReunione);
      owner = fixture.owner;
      addr1 = fixture.addr1;
      addr2 = fixture.addr2;
      addr3 = fixture.addr3;
      reunione = fixture.reunione;
    })

    it('should deploy the smart contract correctly', async function() {
      let numberOfClubs = await reunione.numberOfClubs();
      assert(numberOfClubs.toString() === "0");
    })
  })

  describe('createClub', function() {
    beforeEach(async function() {
      const fixture = await loadFixture(deployReunione);
      owner = fixture.owner;
      addr1 = fixture.addr1;
      addr2 = fixture.addr2;
      addr3 = fixture.addr3;
      reunione = fixture.reunione;
    })

    it('should create a new club', async function() {
      const title = "Blockchain Club";
      const description = "A club for blockchain enthusiasts";
      const duration = 365 * 24 * 60 * 60; // 1 year
      const subscriptionPrice = ethers.parseEther("1");
      const image = "ipfs://imagehash";
      await reunione.createClub(title, description, duration, subscriptionPrice, image);

      const club = await reunione.clubs(0);
      assert(club.owner === owner.address);
      assert(club.title === title);
      assert(club.description === description);
      assert(club.subscriptionPrice.toString() === subscriptionPrice.toString());
      assert(club.image === image);
    })

    it('should revert if duration exceeds maximum limit', async function() {
      const title = "Blockchain Club";
      const description = "A club for blockchain enthusiasts";
      const duration = (365 * 2 + 1) * 24 * 60 * 60; // Over 2 years
      const subscriptionPrice = ethers.parseEther("1");
      const image = "ipfs://imagehash";

      await expect(
        reunione.createClub(title, description, duration, subscriptionPrice, image)
      ).to.be.revertedWithCustomError(reunione, "DurationExceeded");
    })

    it('should revert if subscription price is zero', async function() {
      const title = "Blockchain Club";
      const description = "A club for blockchain enthusiasts";
      const duration = 365 * 24 * 60 * 60; // 1 year
      const subscriptionPrice = 0;
      const image = "ipfs://imagehash";

      await expect(
        reunione.createClub(title, description, duration, subscriptionPrice, image)
      ).to.be.revertedWithCustomError(reunione, "InvalidSubscriptionPrice");
    })
  })

  describe('joinClub', function() {
    beforeEach(async function() {
      const fixture = await loadFixture(deployReunioneAndCreateClub);
      owner = fixture.owner;
      addr1 = fixture.addr1;
      addr2 = fixture.addr2;
      addr3 = fixture.addr3;
      reunione = fixture.reunione;
    })

    it('should allow a user to join a club with correct subscription price', async function() {
      const subscriptionPrice = ethers.parseEther("1");
      await reunione.connect(addr1).joinClub(0, { value: subscriptionPrice });
      const club = await reunione.clubs(0);
      assert(club.amountCollected.toString() === subscriptionPrice.toString());
      assert(await reunione.isMember(0, addr1.address) === true);
    })

    it('should revert if club has ended', async function() {
      await time.increase(365 * 24 * 60 * 60); // Advance time by 1 year
      const subscriptionPrice = ethers.parseEther("1");
      await expect(
        reunione.connect(addr1).joinClub(0, { value: subscriptionPrice })
      ).to.be.revertedWithCustomError(reunione, "ClubEnded");
    })

    it('should revert if incorrect subscription price is sent', async function() {
      const incorrectPrice = ethers.parseEther("0.5");
      await expect(
        reunione.connect(addr1).joinClub(0, { value: incorrectPrice })
      ).to.be.revertedWithCustomError(reunione, "InvalidSubscriptionPayment");
    })
  })

  describe('withdraw', function() {
    beforeEach(async function() {
      const fixture = await loadFixture(deployReunioneAndCreateClub);
      owner = fixture.owner;
      addr1 = fixture.addr1;
      addr2 = fixture.addr2;
      addr3 = fixture.addr3;
      reunione = fixture.reunione;
    })

    it('should allow a member to withdraw funds after club ends', async function() {
      const subscriptionPrice = ethers.parseEther("1");
      await reunione.connect(addr1).joinClub(0, { value: subscriptionPrice });
      await time.increase(2 * 365 * 24 * 60 * 60); // Advance time by 2 years

      const balanceBefore = await ethers.provider.getBalance(addr1.address);
      await reunione.connect(addr1).withdraw(0);
      const balanceAfter = await ethers.provider.getBalance(addr1.address);

      // Convert balances to string for comparison
      const balanceBeforeStr = balanceBefore.toString();
      const balanceAfterStr = balanceAfter.toString();

      assert(balanceAfterStr > balanceBeforeStr, "Balance after withdrawal should be greater than balance before withdrawal");
    });


    it('should revert if club has not ended', async function() {
      const subscriptionPrice = ethers.parseEther("1");
      await reunione.connect(addr1).joinClub(0, { value: subscriptionPrice });

      await expect(
        reunione.connect(addr1).withdraw(0)
      ).to.be.revertedWithCustomError(reunione, "ClubNotEnded");
    })

    it('should revert if caller is not a member', async function() {
      await time.increase(365 * 24 * 60 * 60); // Advance time by 1 year
      await expect(
        reunione.connect(addr2).withdraw(0)
      ).to.be.revertedWithCustomError(reunione, "NotAMember");
    })
  })
})
