import React, { useState } from "react";
import { useSetChain, useConnectWallet } from "@web3-onboard/react";
import { ethers } from "ethers";
import configFile from "./config.json";
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
  } from '@chakra-ui/react'

const config: any = configFile;
interface Report {
    payload: string;
}

export const Balance: React.FC<{appAddress: `0x${string}`}> = ({appAddress}) => {
    const [{ connectedChain }] = useSetChain();
    const [{ wallet }] = useConnectWallet();
    const connectedAccount = wallet?.accounts[0]?.address;

    const inspectCall = async (str: string) => {
        let payload = str;
        if (!connectedChain){
            return;
        }
        let apiURL= ""

        if(config[connectedChain.id]?.inspectAPIURL) {
            apiURL = `${config[connectedChain.id].inspectAPIURL}/inspect/${appAddress}`;
        } else {
            console.error(`No inspect interface defined for chain ${connectedChain.id}`);
            return;
        }
        
        let fetchData: Promise<Response>;
        
        const payloadBlob = new TextEncoder().encode(payload);
        fetchData = fetch(`${apiURL}`, { method: 'POST', body: payloadBlob });
        
        fetchData
            .then(response => response.json())
            .then(data => {
                setReports(data.reports);
                setMetadata({status: data.status, exception_payload: data.exception_payload});
                console.log("Metadata:", data.reports);

                // Decode payload from each report
                const decode = data.reports.map((report: Report) => {
                return ethers.utils.toUtf8String(report.payload);
                });
                console.log("Decoded Reports:", decode);
                const reportData = JSON.parse(decode)
                console.log("Report data: ", reportData)
                setDecodedReports(reportData)
                console.log("Erc20 : ", decodedReports.erc20)
                //console.log(parseEther("1000000000000000000", "gwei"))
            });
    };
    const [reports, setReports] = useState<string[]>([]);
    const [decodedReports, setDecodedReports] = useState<any>({});
    const [metadata, setMetadata] = useState<any>({});

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
                            <Td colSpan={4} textAlign={'center'} fontSize='14' color='grey' >looks like your cartesi dapp balance is zero! 🙁</Td>
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
            <Button onClick={() => inspectCall(`balance/${connectedAccount}`)}>Get Balance</Button>
            </Stack>
        </TableContainer>
        </Box>
    );
};
