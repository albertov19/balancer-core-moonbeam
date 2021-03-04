const { ethers } = require('hardhat');

// Variables
let tx;

// Deploy function
async function deploy() {
   console.log(`----- DEPLOYMENTS -----`);
   [account1] = await ethers.getSigners();

   deployerAddress = account1.address;
   console.log(
      `Deploying balancer actions and DS Proxy using ${deployerAddress}`
   );

   //Deploy DSProxyFactory
   const dsProxy = await ethers.getContractFactory('DSProxyFactory');
   const dsProxyInstance = await dsProxy.deploy();
   await dsProxyInstance.deployed();

   //Deploy DSProxyRegistry
   const dsProxyRegistry = await ethers.getContractFactory('ProxyRegistry');
   const dsProxyRegInstance = await dsProxyRegistry.deploy(
      dsProxyInstance.address
   );
   await dsProxyRegInstance.deployed();
   console.log(
      `Deploy: DSProxyRegistry deployed to : ${dsProxyRegInstance.address}`
   );

   //Deploy BActions
   const bActions = await ethers.getContractFactory('BActions');
   const bActionsInstance = await bActions.deploy();
   await bActionsInstance.deployed();
   console.log(`Deploy: BActions deployed to : ${bActionsInstance.address}`);
}

deploy()
   .then(() => process.exit(0))
   .catch((error) => {
      console.error(error);
      process.exit(1);
   });
