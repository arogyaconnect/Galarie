const ArtToken = artifacts.require("ArtToken");
const ArtMarketplace = artifacts.require("ArtMarketplace");

module.exports = async function(deployer) {
  await deployer.deploy(ArtToken);

  const token = await ArtToken.deployed();
  console.log("ArtToken deployed at:", token.address);

  await deployer.deploy(ArtMarketplace, token.address);

  const market = await ArtMarketplace.deployed();
  console.log("ArtMarketplace deployed at:", market.address);

  await token.setMarketplace(market.address);
  console.log("Marketplace address set in ArtToken contract.");
};
