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
import configFile from "./config.json";
import { erc20PortalAddress } from "@cartesi/viem/abi";

const config: any = configFile;

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

  const depositErc20ToPortal = async (token: `0x${string}`, value: bigint) => {
    try {
      if (chainId) {
        const client = await getClient(chainId);
        const walletClient = await getWalletClient(chainId);

        if (!client || !walletClient) return;

        const [address] = await walletClient.requestAddresses();
        if (!address) return;

        const currAllowance = await client.readContract({
          address: token,
          abi: erc20Abi,
          functionName: "allowance",
          args: [address, erc20PortalAddress],
        });

        if (currAllowance < value) {
          const { request } = await client.simulateContract({
            account: address,
            address: token,
            abi: erc20Abi,
            functionName: "approve",
            args: [erc20PortalAddress, value],
          });
          const txHash = await walletClient.writeContract(request);
          await client.waitForTransactionReceipt({ hash: txHash });
        }

        const data = toHex(`Deposited (${value}) of ERC20 (${token}).`);

        const txHash = await walletClient.depositERC20Tokens({
          account: address,
          token: token,
          chain: chains[chainId],
          execLayerData: data,
          amount: value,
          application: erc20PortalAddress,
        });

        await client.waitForTransactionReceipt({ hash: txHash });
      }
    } catch (e) {
      if (e instanceof BaseError) {
        console.error(e.message);
      } else {
        console.error(e);
      }
    }
  };

  const withdrawErc20 = async (amount: number, token: string) => {
    try {
      if (chainId && props.appAddress) {
        const client = await getClient(chainId);
        const walletClient = await getWalletClient(chainId);

        if (!client || !walletClient) return;

        const [address] = await walletClient.requestAddresses();
        if (!address) return;

        const amountInWei = parseUnits(amount.toString(), 18);
        const input_obj = {
          method: "erc20_withdraw",
          args: {
            erc20: token,
            amount: amountInWei.toString(),
          },
        };
        const data = JSON.stringify(input_obj);
        const payload = toHex(data);
        
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
                      placeholder="Token Address"
                      onChange={(e) => setErc20Token(String(e.target.value))}
                      value={erc20Token}
                    />
                    <Input
                      type="number"
                      step="any"
                      placeholder="Amount"
                      onChange={(e) => setErc20Amount(Number(e.target.value))}
                      value={erc20Amount}
                    />
                    <Button
                      colorScheme="blue"
                      size="sm"
                      onClick={() => depositErc20ToPortal(erc20Token as `0x${string}`, BigInt(erc20Amount))}
                      disabled={!chainId}
                    >
                      Deposit
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => {
                        withdrawErc20(erc20Amount, erc20Token);
                      }}
                      disabled={!chainId}
                    >
                      Withdraw
                    </Button>
                  </Stack>
                  <br/>
                </AccordionPanel>
              </AccordionItem>
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
            <Notices appAddress={props.appAddress} />
            <br />
            <Reports />
          </TabPanel>
        </TabPanels>
      </Box>
    </Tabs>
    //</div>
  );
};
