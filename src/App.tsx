import { FC, useState, useEffect } from "react";
import injectedModule from "@web3-onboard/injected-wallets";
import { init, useConnectWallet, useSetChain } from "@web3-onboard/react";
import { Transfers } from "./Transfers";
import { Network } from "./Network";
import configFile from "./config.json";
import { Balance } from "./Balance";
import {Input, Box, InputGroup, InputLeftAddon, Stack, SimpleGrid} from "@chakra-ui/react"
import type { Hex } from "viem";
//import RPCReader from "./RPCReader";

const config: any = configFile;

const injected: any = injectedModule();
init({
    wallets: [injected],
    chains: Object.entries(config).map(([k, v]: [string, any], i) => ({id: k, token: v.token, label: v.label, rpcUrl: v.rpcUrl})),
    appMetadata: {
        name: "Cartesi Rollups Wallet",
        icon: "<svg><svg/>",
        description: "Demo Wallet app for Cartesi Rollups",
        recommendedInjectedWallets: [
            { name: "MetaMask", url: "https://metamask.io" },
        ],
    },
});

type NetworkProp = typeof Network extends FC<infer P> ? P : never;

const App: FC = () => {
    const [appAddress, setAppAddress] = useState<string>("0x6d3c6d9507a3a941da262da3aa3ba64b98c5e416");
    const [nodeAddress, setNodeAddress] = useState<string | undefined>(
        "http://localhost:8080",
    );

    const [{ connectedChain }] = useSetChain();
    const [chainId, setChainId] = useState<number>();
    const [{ wallet, connecting }, ] = useConnectWallet();

    useEffect(() => {
        if (connectedChain) {
            console.log("connectedChain: ", connectedChain);
            setChainId(parseInt(connectedChain.id, 16));
        }
    }, [connectedChain]);

    const connect: NetworkProp["onChange"] = (chain) => {
    setChainId(chain);
    };

    const handleAddress = (value: string) => {
    setAppAddress(value as Hex);
    };
    return (
        <SimpleGrid columns={1} marginLeft={'25%'} marginRight={'25%'}>  
            <Network onChange={connect} />
            {/* <RPCReader /> */} 
            {wallet && (
                <>
            <Stack>
                <Box alignItems='baseline' marginLeft='2' mt='0'>
                    <InputGroup size='xs'>
                    <InputLeftAddon>
                        Dapp Address
                    </InputLeftAddon> 
                    <Input 
                        width='auto'
                        size='xs'
                        className="address-textbox"
                        type="text"
                        value={appAddress}
                        onChange={(e) => { handleAddress(e.target.value); }}
                    />
                    </ InputGroup >
                    <br /><br />
                </Box>
            </Stack>
                <br />
                    <Balance appAddress={appAddress as `0x${string}`} />
                    <br /> <br />
                    <Transfers appAddress={appAddress as `0x${string}`} chain={chainId as number}  nodeAddress={nodeAddress as string} />
                    <br /> <br />
                    </>
                )}
        </SimpleGrid>
    );
};

export default App;
