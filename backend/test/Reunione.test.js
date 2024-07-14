const {
  time,
  loadFixture,
} = require("@nomicfoundation/hardhat-toolbox/network-helpers");
const { anyValue } = require("@nomicfoundation/hardhat-chai-matchers/withArgs");
const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Reunione", function () {
  async function deployReunioneFixture() {
    const [owner, addr1, addr2, addr3] = await ethers.getSigners();
    const Reunione = await ethers.getContractFactory("Reunione");
    const reunione = await Reunione.deploy();
    return { reunione, owner, addr1, addr2, addr3 };
  }

  describe("Deployment", function () {
    it("Should set the correct initial state", async function () {
      const { reunione } = await loadFixture(deployReunioneFixture);
      expect(await reunione.numberOfClubs()).to.equal(0);
    });
  });

  describe("Club Creation", function () {
    it("Should create a club with correct parameters", async function () {
      const { reunione, owner } = await loadFixture(deployReunioneFixture);
      const title = "Test Club";
      const description = "A test club";
      const duration = 30; // 30 days
      const subscriptionPrice = ethers.parseEther("0.1");
      const image = "https://example.com/image.jpg";
      const publicPostFee = ethers.parseEther("0.01");

      await expect(reunione.createClub(title, description, duration, subscriptionPrice, image, publicPostFee))
        .to.emit(reunione, "ClubCreated")
        .withArgs(0, owner.address, title, description, anyValue, subscriptionPrice, image, publicPostFee);

      const club = await reunione.getClub(0);
      expect(club.title).to.equal(title);
      expect(club.description).to.equal(description);
      expect(club.subscriptionPrice).to.equal(subscriptionPrice);
      expect(club.image).to.equal(image);
      expect(club.publicPostFee).to.equal(publicPostFee);

      console.log("Club end time:", club.end.toString());
      console.log("Current block timestamp:", (await ethers.provider.getBlock("latest")).timestamp);
    });

    it("Should revert if duration exceeds MAX_DURATION", async function () {
      const { reunione } = await loadFixture(deployReunioneFixture);
      const invalidDuration = 731; // MAX_DURATION + 1
      await expect(reunione.createClub("Test", "Test", invalidDuration, ethers.parseEther("0.1"), "test", ethers.parseEther("0.01")))
        .to.be.revertedWithCustomError(reunione, "DurationExceeded");
    });

    it("Should revert if subscription price is zero", async function () {
      const { reunione } = await loadFixture(deployReunioneFixture);
      await expect(reunione.createClub("Test", "Test", 30, 0, "test", ethers.parseEther("0.01")))
        .to.be.revertedWithCustomError(reunione, "InvalidSubscriptionPrice");
    });
  });


  describe("Joining Clubs", function () {
    let reunione, owner, addr1, addr2, addr3, clubId;

    beforeEach(async function () {
      const Reunione = await ethers.getContractFactory("Reunione");
      reunione = await Reunione.deploy();
      [owner, addr1, addr2, addr3] = await ethers.getSigners();

      const title = "Test Club";
      const description = "A test club";
      const duration = 365; // 365 days
      const subscriptionPrice = ethers.parseEther("0.1");
      const image = "https://example.com/image.jpg";
      const publicPostFee = ethers.parseEther("0.01");

      await reunione.createClub(title, description, duration, subscriptionPrice, image, publicPostFee);
      clubId = 0;

      const club = await reunione.getClub(clubId);
      console.log("Club end time:", club.end.toString());
      console.log("Current block timestamp:", (await ethers.provider.getBlock("latest")).timestamp);
    });

    it("Should allow a user to join a club", async function () {
      const joinFee = await reunione.calculateJoinFee(clubId);
      console.log("Join Fee:", joinFee.toString());

      await expect(reunione.connect(addr1).joinClub(clubId, { value: joinFee }))
        .to.emit(reunione, "JoinedClub")
        .withArgs(clubId, addr1.address, joinFee);

      expect(await reunione.isMember(clubId, addr1.address)).to.be.true;
    });

    it("Should calculate correct join fee", async function () {
      const initialJoinFee = await reunione.calculateJoinFee(clubId);
      console.log("Initial Join Fee:", initialJoinFee.toString());

      await reunione.connect(addr1).joinClub(clubId, { value: initialJoinFee });

      const secondJoinFee = await reunione.calculateJoinFee(clubId);
      console.log("Second Join Fee:", secondJoinFee.toString());

      expect(secondJoinFee).to.be.gte(initialJoinFee);

      await reunione.connect(addr2).joinClub(clubId, { value: secondJoinFee });
    });

    it("Should revert if club has ended", async function () {
      await ethers.provider.send("evm_increaseTime", [366 * 24 * 60 * 60]); // 366 days
      await ethers.provider.send("evm_mine");

      const club = await reunione.getClub(clubId);
      console.log("Club end time:", club.end.toString());
      console.log("Current block timestamp:", (await ethers.provider.getBlock("latest")).timestamp);

      const joinFee = await reunione.calculateJoinFee(clubId);
      await expect(reunione.connect(addr1).joinClub(clubId, { value: joinFee }))
        .to.be.revertedWithCustomError(reunione, "ClubEnded");
    });

    it("Should revert if user is already a member", async function () {
      const joinFee = await reunione.calculateJoinFee(clubId);
      await reunione.connect(addr1).joinClub(clubId, { value: joinFee });
      await expect(reunione.connect(addr1).joinClub(clubId, { value: joinFee }))
        .to.be.revertedWithCustomError(reunione, "AlreadyAMember");
    });

    it("Should revert if join fee is incorrect", async function () {
      const joinFee = await reunione.calculateJoinFee(clubId);
      console.log("Correct Join Fee:", joinFee.toString());
      if (joinFee > 0) {
        const incorrectFee = joinFee - BigInt(1); // Subtract 1 wei from the correct fee
        console.log("Incorrect Join Fee:", incorrectFee.toString());
        await expect(reunione.connect(addr1).joinClub(clubId, { value: incorrectFee }))
          .to.be.revertedWithCustomError(reunione, "InvalidSubscriptionPrice");
      } else {
        console.log("Join fee is 0, skipping incorrect fee test");
      }
    });
  });
});
