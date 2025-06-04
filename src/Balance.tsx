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
  } from '@chakra-ui/react'

const config: any = configFile;
interface Report {
    payload: string;
}

export const Balance: React.FC<{appAddress: `0x${string}`}> = ({appAddress}) => {
    const [{ connectedChain }] = useSetChain();
    const [{ wallet }] = useConnectWallet();
    const connectedAccount = wallet?.accounts[0]?.address;
    const toast = useToast();
    const [isLoading, setIsLoading] = useState(false);
    const [reports, setReports] = useState<string[]>([]);
    const [decodedReports, setDecodedReports] = useState<any>({});

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

        // Validate app address
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

            const client = createCartesiPublicClient({
                transport: http(config[connectedChain.id].inspectAPIURL)
            });

            // Try to get application info to validate it exists
            try {
                await client.getApplication({ application: appAddress });
            } catch (error) {
                toast({
                    title: "Invalid Application",
                    description: "The provided application address is not valid on this network",
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

                setReports(data.reports);

                // Decode payload from each report
                if (data.reports && data.reports.length > 0) {
                    const decode = data.reports.map((report: Report) => {
                        return ethers.utils.toUtf8String(report.payload);
                    });
                    try {
                        const reportData = JSON.parse(decode);
                        setDecodedReports(reportData);
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

    return (
        <Box borderWidth='1px' borderRadius='lg' overflow='hidden'>
        <TableContainer>
            <Stack>
            <Table variant='striped' size="lg">
                <Thead>
                    <Tr>
                        <Th textAlign={'center'}>Ether</Th>
                        <Th textAlign={'center'}>ERC-20</Th>
                        <Th textAlign={'center'}>ERC-721</Th>
                    </Tr>
                </Thead>
                <Tbody>
                    {reports?.length === 0 && (
                        <Tr>
                            <Td colSpan={4} textAlign={'center'} fontSize='14' color='grey' >Zero in-app balance! Deposit an asset to get started. </Td>
                        </Tr>
                    )}
                
                    {<Tr key={`${decodedReports}`}>
                        {decodedReports && decodedReports.ether && (
                        <Td textAlign={'center'}>{ethers.utils.formatEther(decodedReports.ether)}</Td> )}
                        { decodedReports && decodedReports.erc20 && (
                        <Td textAlign={'center'}>
                            <div>📍 {String(decodedReports.erc20).split(",")[0]}</div>
                            <div>🤑 {Number(String(decodedReports.erc20).split(",")[1]) > 0 ? Number(String(decodedReports.erc20).split(",")[1]) / 10**18 : null} </div>
                        </Td> )}
                        {decodedReports && decodedReports.erc721 && (
                        <Td textAlign={'center'}>
                            <div>📍 {String(decodedReports.erc721).split(",")[0]}</div>
                            <div>🆔 {String(decodedReports.erc721).split(",")[1]}</div>
                        </Td> )}
                    </Tr>}
                </Tbody>
            </Table>
            <Button 
                onClick={() => inspectCall(`balance/${connectedAccount}`)}
                isLoading={isLoading}
                loadingText="Fetching balance..."
            >
                Get Balance
            </Button>
            </Stack>
        </TableContainer>
        </Box>
    );
};
