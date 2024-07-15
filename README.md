# Reunione

Reunione is a decentralized application (DApp) for creating and managing time-limited, subscription-based clubs on the Ethereum blockchain. It allows users to create clubs, join existing clubs, post content, and withdraw funds after the club's duration ends.

# Project Demo

For a detailed walkthrough of the Reunione project, check out our video presentation:

[![Reunione Project Demo](https://cdn.loom.com/sessions/thumbnails/5a75f63278da413682c6a28894365d1a-with-play.gif)](https://www.loom.com/share/5a75f63278da413682c6a28894365d1a?sid=f8ce7384-f1f7-495b-ae74-ec6f6a88bf47)

Click on the image above to watch the full demo video.

## Features

- Create clubs with customizable duration, subscription price, and public post fee
- Join clubs by paying a dynamically calculated join fee
- Post content as a club member or as a public user (with a fee)
- Automatically end clubs after their duration expires
- Withdraw funds equally among members after the club ends
- View club details, members, and posts

## Project Structure

```
reunione/
├── backend/
│   ├── contracts/
│   │   └── Reunione.sol
│   ├── test/
│   │   └── Reunione.test.js
│   ├── scripts/
│   │   └── deploy.js
│   ├── package.json
│   └── README.md
├── frontend/
│   ├── components/
│   ├── pages/
│   ├── public/
│   ├── styles/
│   ├── package.json
│   └── next.config.js
└── README.md
```

## Technologies Used

### Backend
- Solidity: For writing the smart contract
- Hardhat: Development environment and testing framework
- Ethers.js: Ethereum wallet implementation and utilities
- Chai: Assertion library for tests

### Frontend
- Next.js: React framework for building the user interface
- Rainbow Kit: Ethereum wallet connection library
- Tailwind CSS: Utility-first CSS framework for styling

## Getting Started

### Backend

1. Clone the repository:
   ```
   git clone https://github.com/mszjar/reunione.git
   cd reunione/backend
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Compile the smart contract:
   ```
   npx hardhat compile
   ```

4. Run tests:
   ```
   npx hardhat test
   ```

5. Deploy to a local Hardhat network:
   ```
   npx hardhat run scripts/deploy.js
   ```

### Frontend

1. Navigate to the frontend directory:
   ```
   cd ../frontend
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Run the development server:
   ```
   npm run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Testing

### Backend

The project includes a comprehensive test suite covering all major functionalities of the Reunione smart contract. Tests are written in JavaScript using the Hardhat testing framework and Chai assertions. The test suite covers:

- Contract deployment
- Club creation
- Joining clubs
- Posting (both member and public posts)
- Withdrawals
- Getter functions

To run the tests with coverage report:

```
npx hardhat coverage
```

### Frontend

[Add information about frontend testing if applicable]

## Deployment

### Backend

To deploy the Reunione contract to a live network (e.g., Ethereum mainnet or a testnet), update the `hardhat.config.js` file with your network configuration and run:

```
npx hardhat run scripts/deploy.js --network sepolia
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License.

## Disclaimer

This project is for educational purposes only. Do not use in production without proper auditing and testing.
