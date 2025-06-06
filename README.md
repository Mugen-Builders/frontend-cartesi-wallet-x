# Frontend-Cartesi-Wallet-x

```
Cartesi Rollups version: 2.0.x
```

## Features

This repository will help you get started with building a frontend wallet functionality for your Cartesi dApps:

- Switch Networks
  - Localhost
  - Testnets & Mainnet
- Check Cartesi account balance
- Transfer assets 
  - Ether
  - ERC20
  - ERC721
- Show activity
  - Notices
  - Reports
- Perform Withdrawals
  - Voucher Execution

## Configurtion

Edit src/config.json to set the testnet parameters and deployment, inspect, graphql, rpc addresses.

## Available Scripts

In the project directory, run:

```shell
pnpm install
```

to build the app.

```shell
pnpm dev
```

Runs the app in the development mode.\
Open [http://localhost:5173](http://localhost:5173) to view it in the browser.

## Voucher Notes

To execute Vouchers, the voucher epoch must be finalized so the rollups framework generate the proofs.
As a reminder, you can advance time in hardhat with the command:

```shell
curl --data '{"id":1337,"jsonrpc":"2.0","method":"evm_increaseTime","params":[864010]}' http://localhost:8545
```
Alternatively, you can run cartesi node with shorter epoch duration in seconds
```
cartesi start --epoch-duration=60
```

[![Open in Gitpod](https://gitpod.io/button/open-in-gitpod.svg)](https://gitpod.io/#https://github.com/lynoferraz/frontend-web-cartesi)

