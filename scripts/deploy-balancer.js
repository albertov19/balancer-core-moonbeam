const { ethers } = require('hardhat');

// Variables
let tx;
let txReceipt;
const approvalAmount = '1000';
const wethMint = '1000';

// Pool Configuration (tok0 is WETH)
const pool1 = {
  weight: {
    tok0: '10',
    tok1: '10',
    tok2: '10',
    tok3: '0',
  },
  bind: {
    tok0: '100',
    tok1: '200',
    tok2: '300',
    tok3: '0',
  },
};
const pool2 = {
  weight: {
    tok0: '10',
    tok1: '10',
    tok2: '10',
    tok3: '10',
  },
  bind: {
    tok0: '100',
    tok1: '200',
    tok2: '300',
    tok3: '400',
  },
};
const pool3 = {
  weight: {
    tok0: '20',
    tok1: '10',
    tok2: '0',
    tok3: '5',
  },
  bind: {
    tok0: '200',
    tok1: '200',
    tok2: '0',
    tok3: '200',
  },
};
const pool4 = {
  weight: {
    tok0: '15',
    tok1: '0',
    tok2: '0',
    tok3: '5',
  },
  bind: {
    tok0: '100',
    tok1: '0',
    tok2: '0',
    tok3: '100',
  },
};
const pools = { pool1, pool2, pool3, pool4 };

const swapFee = '0.05';

// Deploy function
async function deploy() {
  console.log(`----- DEPLOYMENTS -----`);
  [account1] = await ethers.getSigners();

  deployerAddress = account1.address;
  console.log(`Deploying core contracts using ${deployerAddress}`);

  // Deploy Factory
  const factory = await ethers.getContractFactory('BFactory');
  const factoryInstance = await factory.deploy();
  await factoryInstance.deployed();
  console.log(`Deploy: BFactory deployed to : ${factoryInstance.address}`);

  // If not Moonbase -> Deploy New Pool - Get Address and Create Instance
  if (hre.network.name !== 'moonbase') {
    tx = await factoryInstance.newBPool();
    txReceipt = await tx.wait();
    const poolAddress1 = txReceipt.logs[1].address;
    console.log(`Deploy: BPool1 deployed to : ${poolAddress1}`);
    const pool1 = await ethers.getContractFactory('BPool');
    const poolInstance1 = pool1.attach(poolAddress1);
    tx = await factoryInstance.newBPool();
    txReceipt = await tx.wait();
    const poolAddress2 = txReceipt.logs[1].address;
    console.log(`Deploy: BPool2 deployed to : ${poolAddress2}`);
    const pool2 = await ethers.getContractFactory('BPool');
    const poolInstance2 = pool2.attach(poolAddress2);
    tx = await factoryInstance.newBPool();
    txReceipt = await tx.wait();
    const poolAddress3 = txReceipt.logs[1].address;
    console.log(`Deploy: BPool3 deployed to : ${poolAddress3}`);
    const pool3 = await ethers.getContractFactory('BPool');
    const poolInstance3 = pool3.attach(poolAddress3);
    tx = await factoryInstance.newBPool();
    txReceipt = await tx.wait();
    const poolAddress4 = txReceipt.logs[1].address;
    console.log(`Deploy: BPool4 deployed to : ${poolAddress4}`);
    const pool4 = await ethers.getContractFactory('BPool');
    const poolInstance4 = pool4.attach(poolAddress4);
  }

  //Deploy WETH
  const weth = await ethers.getContractFactory('WETH');
  const wethInstance = await weth.deploy();
  await wethInstance.deployed();
  wethAddress = wethInstance.address;
  console.log(`Deploy: WETH deployed to : ${wethAddress}`);

  //Deploy ExchangeProxy
  const proxy = await ethers.getContractFactory('ExchangeProxy');
  const proxyInstance = await proxy.deploy(wethAddress);
  await proxyInstance.deployed();
  console.log(`Deploy: Proxy deployed to : ${proxyInstance.address}`);

  //Deploy Multicall (needed for Interface)
  const multicall = await ethers.getContractFactory('Multicall');
  const multicallInstance = await multicall.deploy();
  await multicallInstance.deployed();
  console.log(`Deploy: Multicall deployed to : ${multicallInstance.address}`);

  //Deploy sorMultiCall
  const sorMC = await ethers.getContractFactory('sorMultiCall');
  const sorMCInstance = await sorMC.deploy();
  await sorMCInstance.deployed();
  console.log(`Deploy: sorMultiCall deployed to : ${sorMCInstance.address}`);

  // If not Moonbase -> Deploy Tokens and Bind Pools
  if (hre.network.name !== 'moonbase') {
    const tok1 = await ethers.getContractFactory('Token');
    const tok1Instance = await tok1.deploy('Token1', 'TOK1');
    await tok1Instance.deployed();
    const tok1Address = tok1Instance.address;
    console.log(`Deploy: Token1 deployed to : ${tok1Address}`);

    const tok2 = await ethers.getContractFactory('Token');
    const tok2Instance = await tok2.deploy('Token2', 'TOK2');
    await tok2Instance.deployed();
    const tok2Address = tok2Instance.address;
    console.log(`Deploy: Token2 deployed to : ${tok2Address}`);

    const tok3 = await ethers.getContractFactory('Token');
    const tok3Instance = await tok3.deploy('Token3', 'TOK3');
    await tok3Instance.deployed();
    const tok3Address = tok3Instance.address;
    console.log(`Deploy: Token3 deployed to : ${tok3Address}`);

    const BPools = [proxyInstance, poolInstance1, poolInstance2, poolInstance3, poolInstance4];

    const Tokens = [wethInstance, tok1Instance, tok2Instance, tok3Instance];

    console.log(`----- MINTS AND APPROVALS -----`);

    //Deposit DEV to get WETH
    console.log(`WETH: minting ${wethMint} for ${deployerAddress}`);
    tx = await wethInstance.deposit({
      value: ethers.utils.parseEther(wethMint),
    });
    await tx.wait();

    //Approve Pool on tokens
    for (i = 0; i <= BPools.length - 1; i++) {
      for (j = 0; j <= Tokens.length - 1; j++) {
        if (i === 0) {
          console.log(`Proxy: approving Proxy in ${Tokens[j].address}`);
        } else {
          console.log(`BPool${i}: approving BPool${i} in ${Tokens[j].address}`);
        }

        tx = await Tokens[j].approve(BPools[i].address, ethers.utils.parseEther(approvalAmount));
        await tx.wait();
      }
    }

    //Bind Tokens in Balancer Pool
    for (i = 1; i <= BPools.length - 1; i++) {
      console.log(`\n\n----- BPOOL ${i} OPERATIONS -----`);
      for (j = 0; j <= Tokens.length - 1; j++) {
        let weight = pools[`pool${i}`].weight[`tok${j}`];
        let bind = pools[`pool${i}`].bind[`tok${j}`];

        if (weight != '0') {
          console.log(`BPool${i}: binding ${bind} WETH with weight ${weight}`);

          tx = await BPools[i].bind(
            Tokens[j].address,
            ethers.utils.parseEther(bind),
            ethers.utils.parseEther(weight)
          );
          await tx.wait();
        }
      }

      // Set Swap Fee
      console.log(`BPool${i}: set swap fee`);
      tx = await BPools[i].setSwapFee(ethers.utils.parseEther(swapFee));
      await tx.wait();

      // Set Public Swap
      console.log(`BPool${i}: set public Swap`);
      tx = await BPools[i].setPublicSwap(true);
      await tx.wait();

      // Finalize Pool
      console.log(`BPool${i}: finalize`);
      tx = await BPools[i].finalize();
      await tx.wait();
    }
  }
}

deploy()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
