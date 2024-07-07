// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

contract Reunione {
    uint256 public constant MAX_DURATION = 730;

    error DurationExceeded();
    error InvalidSubscriptionPrice();
    error ClubEnded();
    error InvalidSubscriptionPayment();
    error NotAMember();
    error ClubNotEnded();

    event ClubCreated(uint256 indexed id, address owner, string title, string description, uint256 end, uint256 subscriptionPrice, string image);
    event JoinedClub(uint256 indexed id, address member, uint256 subscriptionPayment);
    event WithdrawnFunds(uint256 indexed id, address member, uint256 amount);

    struct Club {
        address owner;
        string title;
        string description;
        uint256 end;
        uint256 amountCollected;
        string image;
        address payable[] members;
        uint256 subscriptionPrice;
    }

    mapping(uint256 => Club) public clubs;
    mapping(uint256 => mapping(address => bool)) public isMember;

    uint256 public numberOfClubs = 0;

    function createClub(
        string memory _title,
        string memory _description,
        uint256 _duration,
        uint256 _subscriptionPrice,
        string memory _image
    ) public returns (uint256) {
        if (_duration > MAX_DURATION) {
            revert DurationExceeded();
        }
        if (_subscriptionPrice == 0) {
            revert InvalidSubscriptionPrice();
        }

        Club storage club = clubs[numberOfClubs];

        club.owner = msg.sender;
        club.title = _title;
        club.description = _description;
        club.end = block.timestamp + (_duration * 86400);
        club.amountCollected = 0;
        club.image = _image;
        club.subscriptionPrice = _subscriptionPrice;

        numberOfClubs++;

        emit ClubCreated(numberOfClubs - 1, msg.sender, _title, _description, club.end, _subscriptionPrice, _image);

        return numberOfClubs - 1;
    }

    function joinClub(uint256 _id) public payable {
        Club storage club = clubs[_id];

        if (block.timestamp >= club.end) {
            revert ClubEnded();
        }
        if (msg.value != club.subscriptionPrice) {
            revert InvalidSubscriptionPayment();
        }

        club.members.push(payable(msg.sender));
        isMember[_id][msg.sender] = true;
        club.amountCollected += msg.value;

        emit JoinedClub(_id, msg.sender, msg.value);
    }

    function getMembers(uint256 _id) public view returns (address payable[] memory) {
        return clubs[_id].members;
    }

    function getClubs() public view returns (Club[] memory) {
        Club[] memory allClubs = new Club[](numberOfClubs);

        for (uint i = 0; i < numberOfClubs; i++) {
            Club storage item = clubs[i];

            allClubs[i] = item;
        }

        return allClubs;
    }

    function getClub(uint256 _id) public view returns (Club memory) {
        require(_id < numberOfClubs, "Club does not exist");
        return clubs[_id];
    }

    function withdraw(uint256 _id) public {
        Club storage club = clubs[_id];
        if (block.timestamp < club.end) {
            revert ClubNotEnded();
        }
        if (!isMember[_id][msg.sender]) {
            revert NotAMember();
        }

        uint256 memberShare = club.amountCollected / club.members.length;

        payable(msg.sender).transfer(memberShare);

        emit WithdrawnFunds(_id, msg.sender, memberShare);
    }
}
