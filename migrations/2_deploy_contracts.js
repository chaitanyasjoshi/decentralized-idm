var IdentityManager = artifacts.require('../contracts/IdentityManager.sol');

module.exports = function (deployer) {
  deployer.deploy(IdentityManager);
};
