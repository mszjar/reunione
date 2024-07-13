// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

contract Reunione {
    uint256 public constant MAX_DURATION = 730;
    uint256 public constant MAX_POST_LENGTH = 280;
    uint256 public constant DYNAMIC_FEE_PERCENTAGE = 10; // 10% of amountCollected / members

    error DurationExceeded();
    error InvalidSubscriptionPrice();
    error ClubEnded();
    error ClubNotEnded(uint256 endTime, uint256 currentTime);
    error AlreadyAMember();
    error NotAMember();
    error PostTooLong();
    error InsufficientPostFee();
    error PostNotFound();

    event ClubCreated(uint256 indexed id, address owner, string title, string description, uint256 end, uint256 subscriptionPrice, string image, uint256 publicPostFee);
    event JoinedClub(uint256 indexed id, address member, uint256 joinFee);
    event WithdrawnFunds(uint256 indexed id, address member, uint256 amount);
    event PostAdded(uint256 indexed clubId, address author, uint256 postId, string content, uint256 fee, bool isMemberPost);

    struct Club {
        address owner;
        string title;
        string description;
        uint256 end;
        uint256 amountCollected;
        string image;
        address payable[] members;
        uint256 subscriptionPrice;
        uint256 publicPostFee;
        Post[] posts;
        uint256 postCount;
    }

    struct Post {
        address author;
        string content;
        uint256 timestamp;
        uint256 fee;
        bool isMemberPost;
    }

    mapping(uint256 => Club) public clubs;
    mapping(uint256 => mapping(address => bool)) public isMember;

    uint256 public numberOfClubs = 0;

    function createClub(
        string memory _title,
        string memory _description,
        uint256 _duration,
        uint256 _subscriptionPrice,
        string memory _image,
        uint256 _publicPostFee
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
        club.publicPostFee = _publicPostFee;
        club.postCount = 0;

        numberOfClubs++;

        emit ClubCreated(numberOfClubs - 1, msg.sender, _title, _description, club.end, _subscriptionPrice, _image, _publicPostFee);

        return numberOfClubs - 1;
    }

    function calculateJoinFee(uint256 _clubId) public view returns (uint256) {
        Club storage club = clubs[_clubId];
        uint256 baseFee = club.subscriptionPrice;

        uint256 dynamicFee = 0;
        if (club.members.length > 0) {
            dynamicFee = (club.amountCollected * DYNAMIC_FEE_PERCENTAGE) / (100 * club.members.length);
        }

        return baseFee + dynamicFee;
    }

    function joinClub(uint256 _id) public payable {
        Club storage club = clubs[_id];

        if (block.timestamp >= club.end) {
            revert ClubEnded();
        }
        if (isMember[_id][msg.sender]) {
            revert AlreadyAMember();
        }

        uint256 joinFee = calculateJoinFee(_id);
        if (msg.value != joinFee) {
            revert InvalidSubscriptionPrice();
        }

        club.members.push(payable(msg.sender));
        isMember[_id][msg.sender] = true;
        club.amountCollected += msg.value;

        emit JoinedClub(_id, msg.sender, joinFee);
    }

    function getMembers(uint256 _id) public view returns (address payable[] memory) {
        return clubs[_id].members;
    }

    function getClubs() public view returns (Club[] memory) {
        Club[] memory allClubs = new Club[](numberOfClubs);
        for (uint i = 0; i < numberOfClubs; i++) {
            allClubs[i] = clubs[i];
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
            revert ClubNotEnded(club.end, block.timestamp);
        }
        if (!isMember[_id][msg.sender]) {
            revert NotAMember();
        }

        uint256 memberShare = club.amountCollected / club.members.length;

        (bool success, ) = payable(msg.sender).call{value: memberShare}("");
        require(success, "Transfer failed");

        isMember[_id][msg.sender] = false;

        emit WithdrawnFunds(_id, msg.sender, memberShare);
    }

    function addMemberPost(uint256 _clubId, string memory _content) public {
        Club storage club = clubs[_clubId];

        if (!isMember[_clubId][msg.sender]) {
            revert NotAMember();
        }

        if (bytes(_content).length > MAX_POST_LENGTH) {
            revert PostTooLong();
        }

        Post memory newPost = Post({
            author: msg.sender,
            content: _content,
            timestamp: block.timestamp,
            fee: 0,
            isMemberPost: true
        });

        club.posts.push(newPost);
        club.postCount++;

        emit PostAdded(_clubId, msg.sender, club.postCount - 1, _content, 0, true);
    }

    function addPublicPost(uint256 _clubId, string memory _content) public payable {
        Club storage club = clubs[_clubId];

        if (bytes(_content).length > MAX_POST_LENGTH) {
            revert PostTooLong();
        }

        if (msg.value < club.publicPostFee) {
            revert InsufficientPostFee();
        }

        Post memory newPost = Post({
            author: msg.sender,
            content: _content,
            timestamp: block.timestamp,
            fee: msg.value,
            isMemberPost: false
        });

        club.posts.push(newPost);
        club.postCount++;
        club.amountCollected += msg.value;

        emit PostAdded(_clubId, msg.sender, club.postCount - 1, _content, msg.value, false);
    }

    function getPost(uint256 _clubId, uint256 _postId) public view returns (Post memory) {
        require(_clubId < numberOfClubs, "Club does not exist");
        Club storage club = clubs[_clubId];
        if (_postId >= club.postCount) {
            revert PostNotFound();
        }
        return club.posts[_postId];
    }

    function getPostCount(uint256 _clubId) public view returns (uint256) {
        require(_clubId < numberOfClubs, "Club does not exist");
        return clubs[_clubId].postCount;
    }

    function getPosts(uint256 _clubId, uint256 _startIndex, uint256 _endIndex) public view returns (Post[] memory) {
        require(_clubId < numberOfClubs, "Club does not exist");
        Club storage club = clubs[_clubId];
        require(_startIndex < club.postCount && _endIndex <= club.postCount && _startIndex <= _endIndex, "Invalid index range");

        uint256 length = _endIndex - _startIndex;
        Post[] memory result = new Post[](length);
        for (uint256 i = 0; i < length; i++) {
            result[i] = club.posts[_startIndex + i];
        }
        return result;
    }
}
