/**
 * @type import('hardhat/config').HardhatUserConfig
 */

require('@nomiclabs/hardhat-ethers');

// Change private keys accordingly - ONLY FOR DEMOSTRATION PURPOSES - PLEASE STORE PRIVATE KEYS IN A SAFE PLACE
const privateKey1 = '99b3c12287537e38c90a9219d4cb074a89a16e9cdb20bf85728ebd97c343e342';
const privateKey2 = process.env.PK;

module.exports = {
  defaultNetwork: 'hardhat',

  networks: {
    hardhat: {},

    moonbase: {
      url: 'https://rpc.testnet.moonbeam.network',
      accounts: [privateKey2],
      chainId: 1287,
    },
    development: {
      url: 'http://127.0.0.1:9933',
      accounts: [privateKey1],
      network_id: '1281',
      chainId: 1281,
    },
  },
  solidity: {
    compilers: [
      {
        version: '0.5.12',
        settings: {
          optimizer: {
            enabled: true,
            runs: 200,
          },
        },
      },
      {
        version: '0.4.23',
        settings: {
          optimizer: {
            enabled: true,
            runs: 200,
          },
        },
      },
      {
        version: '0.6.12',
        settings: {
          optimizer: {
            enabled: true,
            runs: 200,
          },
        },
      },
    ],
  },
  paths: {
    sources: './contracts',
    cache: './cache',
    artifacts: './artifacts',
  },
  mocha: {
    timeout: 20000,
  },
};
