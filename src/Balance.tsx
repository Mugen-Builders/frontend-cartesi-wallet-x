import React, { useState } from "react";
import { useSetChain, useConnectWallet } from "@web3-onboard/react";
import { ethers } from "ethers";
import configFile from "./config.json";
import { createCartesiPublicClient } from "@cartesi/viem";
import { http } from "viem";
import {
    Table,
    Thead,
    Tbody,
    Tr,
    Th,
    Td,
    TableContainer,
    Button,
    Stack,
    Box,
    useToast,
    Text,
    Heading,
    VStack,
    HStack,
    Badge,
    Divider,
    Image,
} from '@chakra-ui/react'

const config: any = configFile;
interface Report {
    payload: string;
}

interface BalanceResult {
    address: string;
    balances: {
        ETH: string;
        ERC20: Array<{address: string, amount: string}>;
        ERC721: Array<{address: string, tokenId: string}>;
    };
}

export const Balance: React.FC<{appAddress: `0x${string}`}> = ({appAddress}) => {
    const [{ connectedChain }] = useSetChain();
    const [{ wallet }] = useConnectWallet();
    const connectedAccount = wallet?.accounts[0]?.address;
    const toast = useToast();
    const [isLoading, setIsLoading] = useState(false);
    const [reports, setReports] = useState<string[]>([]);
    const [balanceResult, setBalanceResult] = useState<BalanceResult | null>(null);

    const inspectCall = async (str: string) => {
        let payload = str;
        if (!connectedChain){
            toast({
                title: "Error",
                description: "Please connect to a network first",
                status: "error",
                duration: 5000,
                isClosable: true,
            });
            return;
        }

        try {
            if (!config[connectedChain.id]?.inspectAPIURL) {
                toast({
                    title: "Error",
                    description: `No inspect interface defined for chain ${connectedChain.id}`,
                    status: "error",
                    duration: 5000,
                    isClosable: true,
                });
                return;
            }

            let apiURL = `${config[connectedChain.id].inspectAPIURL}/inspect/${appAddress}`;
            
            setIsLoading(true);
            try {
                const payloadBlob = new TextEncoder().encode(payload);
                const response = await fetch(`${apiURL}`, { method: 'POST', body: payloadBlob });
                const data = await response.json();
                console.log("DATA from inspect: ", data);

                if (data.status === "Rejected") {
                    toast({
                        title: "Server Error",
                        description: "The server rejected the request. Please try again later.",
                        status: "error",
                        duration: 5000,
                        isClosable: true,
                    });
                    return;
                }

                if (data.status === "Accepted") {
                    if (!data.reports || data.reports.length === 0) {
                        toast({
                            title: "No Data",
                            description: "No balance data available. This might be due to an error in processing.",
                            status: "warning",
                            duration: 5000,
                            isClosable: true,
                        });
                    }
                }

                //setReports(data.reports);

                // Decode payload from each report
                if (data.reports && data.reports.length > 0) {
                    const decode = data.reports.map((report: Report) => {
                        return ethers.utils.toUtf8String(report.payload);
                    });
                    try {
                        const result = JSON.parse(decode[0]);
                        setBalanceResult(result);
                    } catch (parseError) {
                        toast({
                            title: "Data Error",
                            description: "Failed to parse balance data",
                            status: "error",
                            duration: 5000,
                            isClosable: true,
                        });
                    }
                }
            } catch (error) {
                toast({
                    title: "Network Error",
                    description: "Failed to fetch balance data. Please check your connection.",
                    status: "error",
                    duration: 5000,
                    isClosable: true,
                });
            } finally {
                setIsLoading(false);
            }
        } catch (error) {
            toast({
                title: "Application Error",
                description: "Failed to validate application address",
                status: "error",
                duration: 5000,
                isClosable: true,
            });
        }
    };

    const formatAddress = (address: string) => {
        return `${address.slice(0, 6)}...${address.slice(-4)}`;
    };

    return (
        <Box 
            borderWidth='1px' 
            borderRadius='xl' 
            overflow='hidden' 
            bg="white"
            boxShadow="sm"
            p={6}
        >
            <VStack spacing={6} align="stretch">
                <HStack justify="space-between" align="center">
                    <HStack spacing={3}>
                        <Image 
                            src="/ctsi-icon.svg" 
                            alt="Cartesi Logo" 
                            boxSize="32px"
                            borderRadius="md"
                        />
                        <VStack align="start" spacing={1}>
                            <Heading size="md">Application Wallet</Heading>
                            {connectedAccount && (
                                <Text fontSize="sm" color="gray.500">
                                    {formatAddress(connectedAccount)}
                                </Text>
                            )}
                        </VStack>
                    </HStack>
                    <Button 
                        size="sm"
                        colorScheme="blue"
                        variant="outline"
                        onClick={() => inspectCall(`balance/${connectedAccount}`)}
                        isLoading={isLoading}
                        loadingText="Fetching..."
                    >
                        Refresh
                    </Button>
                </HStack>

                <Divider />

                {!balanceResult ? (
                    <Box 
                        p={8} 
                        textAlign="center" 
                        bg="gray.50" 
                        borderRadius="lg"
                    >
                        <Text color="gray.500">
                            No balance data available. Click refresh to fetch your balance.
                        </Text>
                    </Box>
                ) : (
                    <VStack spacing={6} align="stretch">
                        {/* ETH Balance */}
                        <Box 
                            p={4} 
                            borderWidth="1px" 
                            borderRadius="lg" 
                            bg="blue.50"
                        >
                            <HStack justify="space-between">
                                <HStack>
                                    <Text fontWeight="bold">
                                        {ethers.utils.formatEther(balanceResult.balances.ETH)}
                                    </Text>
                                    <Badge colorScheme="blue" fontSize="md">
                                        ETH
                                    </Badge>
                                </HStack>
                            </HStack>
                        </Box>

                        {/* ERC20 Tokens */}
                        <Box>
                            <Text fontWeight="semibold" mb={2}>ERC20 Tokens</Text>
                            {balanceResult.balances.ERC20.length > 0 ? (
                                <VStack spacing={3} align="stretch">
                                    {balanceResult.balances.ERC20.map((token, index) => (
                                        <Box 
                                            key={index}
                                            p={3}
                                            borderWidth="1px"
                                            borderRadius="md"
                                            bg="gray.50"
                                        >
                                            <HStack justify="space-between">
                                                <Text fontSize="sm" color="gray.600">
                                                    {formatAddress(token.address)}
                                                </Text>
                                                <Text fontWeight="medium">
                                                    {ethers.utils.formatEther(token.amount)}
                                                </Text>
                                            </HStack>
                                        </Box>
                                    ))}
                                </VStack>
                            ) : (
                                <Text color="gray.500" fontSize="sm">No ERC20 tokens</Text>
                            )}
                        </Box>

                        {/* ERC721 Tokens */}
                        <Box>
                            <Text fontWeight="semibold" mb={2}>NFTs (ERC721)</Text>
                            {balanceResult.balances.ERC721.length > 0 ? (
                                <VStack spacing={3} align="stretch">
                                    {balanceResult.balances.ERC721.map((token, index) => (
                                        <Box 
                                            key={index}
                                            p={3}
                                            borderWidth="1px"
                                            borderRadius="md"
                                            bg="gray.50"
                                        >
                                            <HStack justify="space-between">
                                                <Text fontSize="sm" color="gray.600">
                                                    {formatAddress(token.address)}
                                                </Text>
                                                <Badge colorScheme="purple">
                                                    ID: {token.tokenId}
                                                </Badge>
                                            </HStack>
                                        </Box>
                                    ))}
                                </VStack>
                            ) : (
                                <Text color="gray.500" fontSize="sm">No NFTs</Text>
                            )}
                        </Box>
                    </VStack>
                )}
            </VStack>
        </Box>
    );
};
