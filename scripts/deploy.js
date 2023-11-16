const hre = require("hardhat");

async function main() {
  const EphraToken = await hre.ethers.getContractFactory("EphraToken");
  const ephraToken = await EphraToken.deploy(100000000, 50);

  await ephraToken.getDeployedCode();

  console.log("Ephra Token deployed: ", await ephraToken.getAddress());
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
