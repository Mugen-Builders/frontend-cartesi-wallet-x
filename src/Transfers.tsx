// Copyright 2022 Cartesi Pte. Ltd.

// Licensed under the Apache License, Version 2.0 (the "License"); you may not
// use this file except in compliance with the License. You may obtain a copy
// of the license at http://www.apache.org/licenses/LICENSE-2.0

// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
// WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
// License for the specific language governing permissions and limitations
// under the License.

import React, { useEffect, useState } from "react";
import { ethers } from "ethers";
import {
  BaseError,
  erc20Abi,
  erc721Abi,
  parseAbi,
  parseEther,
  parseUnits,
  toHex,
  type Hex,
} from "viem";
import { useWallets } from "@web3-onboard/react";
import { Tabs, TabList, TabPanels, TabPanel, Tab } from "@chakra-ui/react";
import { useToast } from "@chakra-ui/react";
import { Button, Box } from "@chakra-ui/react";
import { Input, Stack } from "@chakra-ui/react";
import {
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
} from "@chakra-ui/react";
import { Text } from "@chakra-ui/react";
import { Vouchers } from "./Vouchers";
import { Notices } from "./Notices";
import { Reports } from "./Reports";
import { INodeComponentProps } from "./utils/models";
import { chains, getClient, getWalletClient } from "./utils/chain";


export const Transfers: React.FC<INodeComponentProps> = (props: INodeComponentProps,) => {
  const [chainId, setChainId] = useState<number>();
  const toast = useToast();

  useEffect(() => {
    console.log("props.chain: ", props.chain); 
    if (!props.chain) {
      setChainId(undefined);
      return;
    }
    setChainId(props.chain);
    console.log("chainId: ", chainId); 
  }, [props.chain]);

  /*
  const depositErc20ToPortal = async (token: string, amount: number) => {
    try {
      if (rollups && provider) {
        const data = ethers.utils.toUtf8Bytes(
          `Deposited (${amount}) of ERC20 (${token}).`
        );
        //const data = `Deposited ${args.amount} tokens (${args.token}) for DAppERC20Portal(${portalAddress}) (signer: ${address})`;
        const signer = provider.getSigner();
        const signerAddress = await signer.getAddress();

        const erc20PortalAddress = rollups.erc20PortalContract.address;
        const tokenContract = signer
          ? IERC20__factory.connect(token, signer)
          : IERC20__factory.connect(token, provider);

        // query current allowance
        const currentAllowance = await tokenContract.allowance(
          signerAddress,
          erc20PortalAddress
        );
        if (ethers.utils.parseEther(`${amount}`) > currentAllowance) {
          // Allow portal to withdraw `amount` tokens from signer
          const tx = await tokenContract.approve(
            erc20PortalAddress,
            ethers.utils.parseEther(`${amount}`)
          );
          const receipt = await tx.wait(1);
          const event = (
            await tokenContract.queryFilter(
              tokenContract.filters.Approval(),
              receipt.blockHash
            )
          ).pop();
          if (!event) {
            throw Error(
              `could not approve ${amount} tokens for DAppERC20Portal(${erc20PortalAddress})  (signer: ${signerAddress}, tx: ${tx.hash})`
            );
          }
        }

        await rollups.erc20PortalContract.depositERC20Tokens(
          token,
          propos.dappAddress,
          ethers.utils.parseEther(`${amount}`),
          data
        );
      }
    } catch (e) {
      console.log(`${e}`);
    }
  };
  */
  const depositEtherToPortal = async (value: number) => {
    try {
      if (chainId) {
        const client = await getClient(chainId);
        const walletClient = await getWalletClient(chainId);
        if (!client || !walletClient) return;
        const [address] = await walletClient.requestAddresses();
        if (!address) return;

        const valueInWei = parseEther(value.toString()); 
        const data = toHex(`Deposited (${value}) ether.`);
        
        
        const txHash = await walletClient.depositEther({
          application: props.appAddress,
          value: valueInWei,
          account: address,
          chain: chains[chainId],
          execLayerData: data,
        });
        await client.waitForTransactionReceipt({ hash: txHash });
      }
    } catch (e) {
      console.log(`${e}`);
    }
  };

  const withdrawEther = async (amount: number) => {
    try {
      if (chainId && props.appAddress) {
        const client = await getClient(chainId);
        const walletClient = await getWalletClient(chainId);

        if (!client || !walletClient) return;

        const [address] = await walletClient.requestAddresses();
        if (!address) return;

        let ether_amount = ethers.utils.parseEther(String(amount)).toString();
        const input_obj = {
          method: "ether_withdraw",
          args: {
            amount: ether_amount,
          },
        };
        const data = JSON.stringify(input_obj);
        let payload = toHex(data);
        const txHash = await walletClient.addInput({
          application: props.appAddress,
          payload,
          account: address,
          chain: chains[chainId],
        });

        await client.waitForTransactionReceipt({ hash: txHash });
      }
    } catch (e) {
      console.log(e);
    }
  };

  /*
  const withdrawErc20 = async (amount: number, address: String) => {
    try {
      if (rollups && provider) {
        let erc20_amount = ethers.utils.parseEther(String(amount)).toString();
        console.log("erc20 after parsing: ", erc20_amount);
        const input_obj = {
          method: "erc20_withdraw",
          args: {
            erc20: address,
            amount: erc20_amount,
          },
        };
        const data = JSON.stringify(input_obj);
        let payload = ethers.utils.toUtf8Bytes(data);
        await rollups.inputContract.addInput(propos.dappAddress, payload);
      }
    } catch (e) {
      console.log(e);
    }
  };
  */

  /*
  const withdrawErc721 = async (address: String, id: number) => {
    try {
      if (rollups && provider) {
        let erc721_id = String(id);
        console.log("erc721 after parsing: ", erc721_id);
        const input_obj = {
          method: "erc721_withdrawal",
          args: {
            erc721: address,
            token_id: id,
          },
        };
        const data = JSON.stringify(input_obj);
        let payload = ethers.utils.toUtf8Bytes(data);
        await rollups.inputContract.addInput(propos.dappAddress, payload);
      }
    } catch (e) {
      console.log(e);
    }
  };
  */

  /*
  const transferNftToPortal = async (
    contractAddress: string,
    nftid: number
  ) => {
    try {
      if (rollups && provider) {
        const data = ethers.utils.toUtf8Bytes(
          `Deposited (${nftid}) of ERC721 (${contractAddress}).`
        );
        //const data = `Deposited ${args.amount} tokens (${args.token}) for DAppERC20Portal(${portalAddress}) (signer: ${address})`;
        const signer = provider.getSigner();
        const signerAddress = await signer.getAddress();

        const erc721PortalAddress = rollups.erc721PortalContract.address;

        const tokenContract = signer
          ? IERC721__factory.connect(contractAddress, signer)
          : IERC721__factory.connect(contractAddress, provider);

        // query current approval
        const currentApproval = await tokenContract.getApproved(nftid);
        if (currentApproval !== erc721PortalAddress) {
          // Allow portal to withdraw `amount` tokens from signer
          const tx = await tokenContract.approve(erc721PortalAddress, nftid);
          const receipt = await tx.wait(1);
          const event = (
            await tokenContract.queryFilter(
              tokenContract.filters.Approval(),
              receipt.blockHash
            )
          ).pop();
          if (!event) {
            throw Error(
              `could not approve ${nftid} for DAppERC721Portal(${erc721PortalAddress})  (signer: ${signerAddress}, tx: ${tx.hash})`
            );
          }
        }

        // Transfer
        rollups.erc721PortalContract.depositERC721Token(
          contractAddress,
          propos.dappAddress,
          nftid,
          "0x",
          data
        );
      }
    } catch (e) {
      console.log(`${e}`);
    }
  };
  */
  const [input, setInput] = useState<string>("");
  const [hexInput, setHexInput] = useState<boolean>(false);
  const [erc20Amount, setErc20Amount] = useState<number>(0);
  const [erc20Token, setErc20Token] = useState<string>("");
  const [erc721Id, setErc721Id] = useState<number>(0);
  const [erc721, setErc721] = useState<string>("");
  const [etherAmount, setEtherAmount] = useState<number>(0);

  return (
    <Tabs variant="enclosed" size="lg" align="center">
      <TabList>
        <Tab>🚀 Transfer</Tab>
        <Tab>🎟️ Vouchers</Tab>
        <Tab>🔔 Activity</Tab>
      </TabList>
      <Box p={4} display="flex">
        <TabPanels>
          <TabPanel>
            <Text fontSize="sm" color="grey">
              Cartesi apps receive asset deposits via Portal smart contracts on
              the base layer.
            </Text>
            <br />
            <Accordion size="xl" defaultIndex={[0]} allowMultiple>
              <AccordionItem>
                <h2>
                  <AccordionButton>
                    Ether
                    <AccordionIcon />
                  </AccordionButton>
                </h2>
                <AccordionPanel>
                  <Stack>
                    <Input
                      type="number"
                      step="any"
                      placeholder="0.0"
                      value={etherAmount}
                      onChange={e => setEtherAmount(Number(e.target.value))}
                    />
                    <Button
                      colorScheme="blue"
                      size="sm"
                      onClick={() => {
                        depositEtherToPortal(etherAmount);
                      }}
                      disabled={!chainId}
                    >
                      Deposit
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => {
                        withdrawEther(etherAmount);
                      }}
                      disabled={!chainId}
                    >
                      Withdraw
                    </Button>
                  </Stack>
                  <br/>
                </AccordionPanel>
              </AccordionItem>
              {/*
              <AccordionItem>
                <h2>
                  <AccordionButton>
                    ERC20
                    <AccordionIcon />
                  </AccordionButton>
                </h2>
                <AccordionPanel>
                  <Stack>
                    <Input
                      type="text"
                      variant="outline"
                      placeholder="Address"
                      onChange={(e) => setErc20Token(String(e.target.value))}
                      value={erc20Token}
                    />
                    <Input
                      type="number"
                      variant="outline"
                      placeholder="Amount"
                      onChange={(e) => setErc20Amount(Number(e.target.value))}
                      value={erc20Amount}
                    />
                    <Button
                    colorScheme="blue"
                    size="sm"
                    onClick={() =>
                        depositErc20ToPortal(erc20Token, erc20Amount)
                    }
                    disabled={!rollups}
                    >
                    Deposit
                    </Button>
                    <Button
                    size="sm"
                    onClick={() => {
                        withdrawErc20(erc20Amount, erc20Token);
                    }}
                    disabled={!rollups}
                    >
                    Withdraw
                    </Button>
                  </Stack>
                  <br/>
                </AccordionPanel>
              </AccordionItem>
              */}
              <AccordionItem>
                <h2>
                  <AccordionButton>
                    ERC721
                    <AccordionIcon />
                  </AccordionButton>
                </h2>
                <AccordionPanel>
                  {/*
                  <Stack>
                    <Input
                      type="text"
                      variant="outline"
                      placeholder="Address"
                      onChange={(e) => setErc721(String(e.target.value))}
                      value={erc721}
                    />
                    <Input
                      type="number"
                      variant="outline"
                      placeholder="ID"
                      onChange={(e) => setErc721Id(Number(e.target.value))}
                      value={erc721Id}
                    />
                    <Button
                      colorScheme="blue"
                      size="sm"
                      onClick={() => transferNftToPortal(erc721, erc721Id)}
                      disabled={!rollups}
                    >
                      Transfer
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => {
                        withdrawErc721(erc721, erc721Id);
                      }}
                      disabled={!rollups}
                    >
                      Withdraw
                    </Button>
                    
                    <br />
                    <br />
                  </Stack> 
                  */}
                </AccordionPanel>
              </AccordionItem>
            </Accordion>
          </TabPanel>

          <TabPanel>
            <Accordion defaultIndex={[0]} allowMultiple>
            <Text fontSize="sm" color="grey">
              After the withdraw request, the user has to execute a valid voucher to transfer assets from the Cartesi app to their account. 
            </Text>
            <br />
            {/* <Vouchers dappAddress={propos.dappAddress} /> */}
            </Accordion>
          </TabPanel>
          <TabPanel>
            <Notices />
            <br />
            <Reports />
          </TabPanel>
        </TabPanels>
      </Box>
    </Tabs>
    //</div>
  );
};
