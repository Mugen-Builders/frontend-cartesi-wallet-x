import React, { useEffect, useState } from "react";
import { useToast, Button, Box, Table, Thead, Tbody, Tr, Th, Td, Badge, Text, VStack, HStack } from '@chakra-ui/react';
import { ethers } from "ethers";
import { getL2Client } from './utils/chain';
import configFile from "./config.json";
import { type Output as CartesiOutput } from "@cartesi/viem";

const config: any = configFile;

type DepositData = {
    type: "deposit";
    tokenType: "ETH" | "ERC20" | "ERC721";
    value: string;
    sender: string;
    token?: string;
    tokenId?: string;
    timestamp: number;
};

export const Notices: React.FC<{appAddress: `0x${string}`}> = ({appAddress}) => {
    const [notices, setNotices] = useState<CartesiOutput[]>([]);
    const [loading, setLoading] = useState(false);
    const toast = useToast();

    const fetchNotices = async () => {
        setLoading(true);
        try {
            const rpcUrl = `${config["0x343a"].inspectAPIURL}/rpc`;
            console.log('Using RPC URL:', rpcUrl);
            const client = await getL2Client(rpcUrl);
            if (!client) {
                throw new Error('Failed to create Cartesi client');
            }

            console.log('Fetching notices for app:', appAddress);
            const result = await client.listOutputs({
                application: appAddress,
                outputType: "Notice",
                limit: 20,
                offset: 0
            });

            console.log('Raw notices data:', result.data);
            setNotices(result.data || []);
        } catch (err) {
            console.error('Error fetching notices:', err);
            toast({
                title: "Error",
                description: err instanceof Error ? err.message : 'Failed to fetch notices',
                status: "error",
                duration: 5000,
                isClosable: true,
            });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (appAddress) {
            fetchNotices();
        }
    }, [appAddress]);

    const decodeNoticeData = (output: CartesiOutput): DepositData | null => {
        try {
            if (!output.decodedData) return null;

            // First parse the outer JSON
            const outerData = JSON.parse(JSON.stringify(output.decodedData));
            console.log('Outer data:', outerData);

            // If it's a Notice type with a hex payload, decode that
            if (outerData.type === "Notice" && outerData.payload) {
                const innerPayload = ethers.utils.toUtf8String(outerData.payload);
                console.log('Decoded inner payload:', innerPayload);
                return JSON.parse(innerPayload);
            }

            return null;
        } catch (error) {
            console.error('Error decoding notice data:', error);
            return null;
        }
    };

    const renderNoticeContent = (output: CartesiOutput) => {
        console.log('Rendering notice:', output);
        
        const data = decodeNoticeData(output);
        if (!data) {
            return (
                <VStack align="start" spacing={1}>
                    <Badge colorScheme="gray">Raw Data</Badge>
                    <Text color="gray.600" fontSize="sm">
                        {JSON.stringify(output.decodedData, null, 2)}
                    </Text>
                </VStack>
            );
        }

        // Handle deposit notices
        if (data.type === "deposit") {
            if (data.tokenType === "ETH") {
                return (
                    <HStack>
                        <Badge colorScheme="cyan">ETH Deposit</Badge>
                        <Text>
                            {ethers.utils.formatEther(data.value)} Ξ deposited by {data.sender}
                        </Text>
                    </HStack>
                );
            }
            if (data.tokenType === "ERC20") {
                return (
                    <HStack>
                        <Badge colorScheme="green">ERC20 Deposit</Badge>
                        <Text>
                            {ethers.utils.formatEther(data.value)} tokens from {data.token} deposited by {data.sender}
                        </Text>
                    </HStack>
                );
            }
            if (data.tokenType === "ERC721") {
                return (
                    <HStack>
                        <Badge colorScheme="purple">NFT Deposit</Badge>
                        <Text>
                            NFT {data.tokenId} from {data.token} deposited by {data.sender}
                        </Text>
                    </HStack>
                );
            }
        }

        // For any other type of notice, display the raw data
        return (
            <VStack align="start" spacing={1}>
                <Badge colorScheme="gray">Raw Data</Badge>
                <Text color="gray.600" fontSize="sm">
                    {JSON.stringify(data, null, 2)}
                </Text>
            </VStack>
        );
    };

    return (
        <Box>
            <Table variant="simple">
                <Thead>
                    <Tr>
                        <Th>
                            <HStack justify="space-between">
                                <Text>Notices</Text>
                                <Button 
                                    size="sm"
                                    colorScheme="blue"
                                    variant="outline"
                                    onClick={fetchNotices}
                                    isLoading={loading}
                                    leftIcon={<span>🔄</span>}
                                >
                                    Refresh
                                </Button>
                            </HStack>
                        </Th>
                    </Tr>
                </Thead>
                <Tbody>
                    {notices.length === 0 ? (
                        <Tr>
                            <Td>No notices found</Td>
                        </Tr>
                    ) : (
                        [...notices].reverse().map((notice) => (
                            <Tr key={`${notice.inputIndex}-${notice.index}`}>
                                <Td>
                                    <VStack align="start" spacing={2}>
                                        <Text fontSize="sm" color="gray.500">
                                            Input #{notice.inputIndex.toString()} • Notice #{notice.index.toString()}
                                        </Text>
                                        {renderNoticeContent(notice)}
                                    </VStack>
                                </Td>
                            </Tr>
                        ))
                    )}
                </Tbody>
            </Table>
        </Box>
    );
};
