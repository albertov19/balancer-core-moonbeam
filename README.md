# Deploy Balancer on Moonbeam with Hardhat

This repository contains the scripts to deploy the Balancer Core contracts to Moonbase Alpha but also a Moonbeam development node.

In Scripts you will find also a test run (with no assertions) that can be run against a local node (much faster).

## Getting Started

Clone this repository 

```
https://github.com/albertov19/balancer-core-moonbeam
cd balancer-core-moonbeam
``` 

Install dependencies:

```
npm i
```

Add your PK in the `hardhat.config.js` file (please take care of you PK, they provide direct access to your funds, this is only for demostration purposes). Once you are ready you can run for a development deployment:

```
npx hardhat run --network development scripts/deploy-balancer.js
npx hardhat run --network development scripts/deploy-bactions.js
```

Or for Moonbase Alpha:

```
npx hardhat run --network moonbase scripts/deploy-balancer.js
npx hardhat run --network moonbase scripts/deploy-bactions.js
```

You can also run the "test" with the following code:

```
npx hardhat run --network development scripts/test-around.js
```

Have fun :) 

