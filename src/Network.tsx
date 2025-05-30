import { FC } from "react";
import { useConnectWallet, useSetChain } from "@web3-onboard/react";
import configFile from "./config.json";
import {Button, Select, Box, Spacer } from "@chakra-ui/react"
import Landing from "./Landing";

const config: any = configFile;

interface Propos {
    onChange(chain: number | undefined, address: `0x${string}` | undefined): void;
  }

export const Network: FC<Propos> = ({ onChange }) => {
    
    const [{ wallet, connecting }, connect, disconnect] = useConnectWallet();
    const [{ chains, connectedChain, settingChain }, setChain] = useSetChain();

    return (
        <Box>
            {!wallet && 
            <Landing />
            }
            {wallet && (
                <Box display='flex' w='100%' ml='2' mt='2' alignItems='baseline'>
                    {settingChain ? (
                        <span>Switching chain...</span>
                    ) : (
                        <Select size='xs' width='auto'
                            onChange={({ target: { value } }) => {
                                console.log("Selected chainId: ", value);
                                if (config[value] !== undefined) {
                                    setChain({ chainId: value })
                                    onChange(parseInt(value, 10), wallet.accounts[0].address);
                                } else {
                                    alert("No deploy on this chain")
                                }
                                }
                            }
                            value={connectedChain?.id}
                        >
                            {chains.map(({ id, label }) => {
                                return (
                                    <option key={id} value={id}>
                                        {label}
                                    </option>
                                );
                            })}
                        </Select>
                    )}
                    <Spacer />
                    <Box alignContent='right'>
                    <Button marginRight={'20px'} size='xs' onClick={() => disconnect(wallet)}>
                    ✂️ Disconnect Wallet
                    </Button>
                    </Box>
                </Box>
            )}
        </Box>
    );
};
