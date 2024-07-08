const hre = require("hardhat");

async function main() {
  // Get the current block timestamp
  let block = await hre.ethers.provider.getBlock("latest");
  console.log("Current block timestamp:", new Date(block.timestamp * 1000).toLocaleString());

  // Advance time by 1 day (86400 seconds)
  const timeToAdvance = 8640000;

  console.log(`Advancing time by ${timeToAdvance} seconds (100 days)`);

  // Advance time
  await hre.network.provider.send("evm_increaseTime", [timeToAdvance]);
  await hre.network.provider.send("evm_mine");

  // Get the new block timestamp
  block = await hre.ethers.provider.getBlock("latest");
  console.log("New block timestamp:", new Date(block.timestamp * 1000).toLocaleString());
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
