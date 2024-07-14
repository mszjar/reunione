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

  // DEPLOYMENT
  describe("Deployment", function () {
    it("Should set the correct initial state", async function () {
      const { reunione } = await loadFixture(deployReunioneFixture);
      expect(await reunione.numberOfClubs()).to.equal(0);
    });
  });

  // CLUB CREATION
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

  // JOINING CLUBS
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
    });

    it("Should allow a user to join a club", async function () {
      const joinFee = await reunione.calculateJoinFee(clubId);

      await expect(reunione.connect(addr1).joinClub(clubId, { value: joinFee }))
        .to.emit(reunione, "JoinedClub")
        .withArgs(clubId, addr1.address, joinFee);

      expect(await reunione.isMember(clubId, addr1.address)).to.be.true;
    });

    it("Should calculate correct join fee", async function () {
      const initialJoinFee = await reunione.calculateJoinFee(clubId);
      await reunione.connect(addr1).joinClub(clubId, { value: initialJoinFee });
      const secondJoinFee = await reunione.calculateJoinFee(clubId);
      expect(secondJoinFee).to.be.gte(initialJoinFee);
      await reunione.connect(addr2).joinClub(clubId, { value: secondJoinFee });
    });

    it("Should revert if club has ended", async function () {
      await ethers.provider.send("evm_increaseTime", [366 * 24 * 60 * 60]); // 366 days
      await ethers.provider.send("evm_mine");

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
      if (joinFee > 0) {
        const incorrectFee = joinFee - BigInt(1); // Subtract 1 wei from the correct fee
        await expect(reunione.connect(addr1).joinClub(clubId, { value: incorrectFee }))
          .to.be.revertedWithCustomError(reunione, "InvalidSubscriptionPrice");
      } else {
        console.log("Join fee is 0, skipping incorrect fee test");
      }
    });
  });

  // POSTING
  describe("Posts", function () {
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

    // Join the club with addr1
    const joinFee = await reunione.calculateJoinFee(clubId);
    await reunione.connect(addr1).joinClub(clubId, { value: joinFee });
  });

    it("Should allow a member to add a post", async function () {
      const content = "This is a member post";
      await expect(reunione.connect(addr1).addMemberPost(clubId, content))
        .to.emit(reunione, "PostAdded")
        .withArgs(clubId, addr1.address, 0, content, 0, true);

      const post = await reunione.getPost(clubId, 0);
      expect(post.author).to.equal(addr1.address);
      expect(post.content).to.equal(content);
      expect(post.isMemberPost).to.be.true;
    });

    it("Should allow public posts with fee", async function () {
      const content = "This is a public post";
      const club = await reunione.getClub(clubId);
      const publicPostFee = club.publicPostFee;

      await expect(reunione.connect(addr2).addPublicPost(clubId, content, { value: publicPostFee }))
        .to.emit(reunione, "PostAdded")
        .withArgs(clubId, addr2.address, 0, content, publicPostFee, false);

      const post = await reunione.getPost(clubId, 0);
      expect(post.author).to.equal(addr2.address);
      expect(post.content).to.equal(content);
      expect(post.isMemberPost).to.be.false;
    });

    it("Should revert if post is too long", async function () {
      const longContent = "a".repeat(281); // MAX_POST_LENGTH + 1
      await expect(reunione.connect(addr1).addMemberPost(clubId, longContent))
        .to.be.revertedWithCustomError(reunione, "PostTooLong");
    });

    it("Should revert if non-member tries to add a member post", async function () {
      await expect(reunione.connect(addr2).addMemberPost(clubId, "Test post"))
        .to.be.revertedWithCustomError(reunione, "NotAMember");
    });

    it("Should revert if public post fee is insufficient", async function () {
      const content = "This is a public post";
      const club = await reunione.getClub(clubId);
      const insufficientFee = club.publicPostFee - BigInt(1); // 1 wei less than required

      await expect(reunione.connect(addr2).addPublicPost(clubId, content, { value: insufficientFee }))
        .to.be.revertedWithCustomError(reunione, "InsufficientPostFee");
    });
  });

  // WITHDRAWALS
  describe("Withdrawals", function () {
    let reunione, owner, addr1, addr2, addr3, clubId;

    beforeEach(async function () {
      const Reunione = await ethers.getContractFactory("Reunione");
      reunione = await Reunione.deploy();
      [owner, addr1, addr2, addr3] = await ethers.getSigners();

      const title = "Test Club";
      const description = "A test club";
      const duration = 30; // 30 days
      const subscriptionPrice = ethers.parseEther("0.1");
      const image = "https://example.com/image.jpg";
      const publicPostFee = ethers.parseEther("0.01");

      await reunione.createClub(title, description, duration, subscriptionPrice, image, publicPostFee);
      clubId = 0;

      let joinFee = await reunione.calculateJoinFee(clubId);

      try {
        await reunione.connect(addr1).joinClub(clubId, { value: joinFee });
      } catch (error) {
        console.error("Error joining club for addr1:", error.message);
      }

      // Recalculate join fee for addr2
      joinFee = await reunione.calculateJoinFee(clubId);

      try {
        await reunione.connect(addr2).joinClub(clubId, { value: joinFee });
      } catch (error) {
        console.error("Error joining club for addr2:", error.message);
      }

      try {
        await reunione.connect(addr3).addPublicPost(clubId, "Public post", { value: publicPostFee });
      } catch (error) {
        console.error("Error adding public post:", error.message);
      }

      const isAddr1Member = await reunione.isMember(clubId, addr1.address);
      const isAddr2Member = await reunione.isMember(clubId, addr2.address);
    });

    async function increaseTime(days) {
      await ethers.provider.send("evm_increaseTime", [days * 24 * 60 * 60]);
      await ethers.provider.send("evm_mine");
    }

    it("Should allow members to withdraw after club ends", async function () {
      await increaseTime(31);

      const initialBalance = await ethers.provider.getBalance(addr1.address);
      await expect(reunione.connect(addr1).withdraw(clubId))
      .to.emit(reunione, "WithdrawnFunds")
      .withArgs(clubId, addr1.address, anyValue);

      const finalBalance = await ethers.provider.getBalance(addr1.address);
      expect(finalBalance).to.be.gt(initialBalance);
    });

    it("Should revert if club has not ended", async function () {
      await expect(reunione.connect(addr1).withdraw(clubId))
      .to.be.revertedWithCustomError(reunione, "ClubNotEnded");
    });

    it("Should revert if non-member tries to withdraw", async function () {
      await increaseTime(31);
      await expect(reunione.connect(addr3).withdraw(clubId))
      .to.be.revertedWithCustomError(reunione, "NotAMember");
    });


    it("Should not allow double withdrawal", async function () {
      await increaseTime(31);

      await reunione.connect(addr1).withdraw(clubId);
      await expect(reunione.connect(addr1).withdraw(clubId))
      .to.be.revertedWithCustomError(reunione, "NotAMember");
    });

    it("Should distribute funds equally among members", async function () {
      await increaseTime(31);

      const initialBalance1 = await ethers.provider.getBalance(addr1.address);
      const initialBalance2 = await ethers.provider.getBalance(addr2.address);

      const tx1 = await reunione.connect(addr1).withdraw(clubId);

      const tx2 = await reunione.connect(addr2).withdraw(clubId);

      const finalBalance1 = await ethers.provider.getBalance(addr1.address);
      const finalBalance2 = await ethers.provider.getBalance(addr2.address);

      const withdrawn1 = finalBalance1 - initialBalance1;
      const withdrawn2 = finalBalance2 - initialBalance2;

      expect(withdrawn1).to.be.closeTo(withdrawn2, ethers.parseEther("0.001"));
    });

    it("Should update member status after withdrawal", async function () {
      await increaseTime(31);

      await reunione.connect(addr1).withdraw(clubId);
      expect(await reunione.isMember(clubId, addr1.address)).to.be.false;
    });
  });

  // GETTER FUNCTIONS
  describe("Getter Functions", function () {
    let reunione, owner, addr1, addr2, addr3, clubId;

    beforeEach(async function () {
      const Reunione = await ethers.getContractFactory("Reunione");
      reunione = await Reunione.deploy();
      [owner, addr1, addr2, addr3] = await ethers.getSigners();

      const title = "Test Club";
      const description = "A test club";
      const duration = 30; // 30 days
      const subscriptionPrice = ethers.parseEther("0.1");
      const image = "https://example.com/image.jpg";
      const publicPostFee = ethers.parseEther("0.01");

      await reunione.createClub(title, description, duration, subscriptionPrice, image, publicPostFee);
      clubId = 0;

      const joinFee = await reunione.calculateJoinFee(clubId);
      await reunione.connect(addr1).joinClub(clubId, { value: joinFee });

      await reunione.connect(addr1).addMemberPost(clubId, "Member post 1");
      await reunione.connect(addr2).addPublicPost(clubId, "Public post 1", { value: publicPostFee });
    });

    it("Should get all clubs", async function () {
      const clubs = await reunione.getClubs();
      expect(clubs.length).to.equal(1);
      expect(clubs[0].title).to.equal("Test Club");
    });

    it("Should get a specific club", async function () {
      const club = await reunione.getClub(clubId);
      expect(club.title).to.equal("Test Club");
      expect(club.members.length).to.equal(1);
      expect(club.postCount).to.equal(2);
    });

    it("Should get club members", async function () {
      const members = await reunione.getMembers(clubId);
      expect(members.length).to.equal(1);
      expect(members[0]).to.equal(addr1.address);
    });

    it("Should get post count", async function () {
      const postCount = await reunione.getPostCount(clubId);
      expect(postCount).to.equal(2);
    });

    it("Should get posts", async function () {
      const posts = await reunione.getPosts(clubId, 0, 2);
      expect(posts.length).to.equal(2);
      expect(posts[0].content).to.equal("Member post 1");
      expect(posts[0].author).to.equal(addr1.address);
      expect(posts[0].isMemberPost).to.be.true;
      expect(posts[1].content).to.equal("Public post 1");
      expect(posts[1].author).to.equal(addr2.address);
      expect(posts[1].isMemberPost).to.be.false;
    });

    it("Should revert when getting a non-existent post", async function () {
      await expect(reunione.getPost(clubId, 2))
        .to.be.revertedWithCustomError(reunione, "PostNotFound");
    });

    it("Should revert when getting a non-existent club", async function () {
      await expect(reunione.getClub(1))
        .to.be.revertedWith("Club does not exist");
    });

    it("Should handle getting posts with invalid range", async function () {
      await expect(reunione.getPosts(clubId, 0, 3))
        .to.be.revertedWith("Invalid index range");
    });

    it("Should handle getting posts from empty club", async function () {
      await reunione.createClub("Empty Club", "No posts", 30, ethers.parseEther("0.1"), "image", ethers.parseEther("0.01"));
      const emptyClubId = 1;

      // Check that the post count is 0
      const postCount = await reunione.getPostCount(emptyClubId);
      expect(postCount).to.equal(0);

      // Trying to get posts should revert with 'Invalid index range'
      await expect(reunione.getPosts(emptyClubId, 0, 1))
        .to.be.revertedWith("Invalid index range");

      // Check that we can't get any posts
      await expect(reunione.getPost(emptyClubId, 0))
        .to.be.revertedWithCustomError(reunione, "PostNotFound");
    });
  });

});
