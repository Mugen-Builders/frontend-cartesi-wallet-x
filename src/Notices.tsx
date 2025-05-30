import React, { useEffect, useState } from "react";
import { useToast } from '@chakra-ui/react'
import { Button } from '@chakra-ui/react'
import {
    Table,
    Thead,
    Tbody,
    Tr,
    Th,
    Td,
    Box
} from '@chakra-ui/react'

type Notice = {
    id: string;
    index: number;
    input: any, 
    payload: string;
};

export const Notices: React.FC = () => {
    //const [result, reexecuteQuery] = useNoticesQuery();
    //const { data, fetching, error } = result;
    const [previousLength, setPreviousLength] = useState<number>(0);

    const toast = useToast()

    useEffect(() => {
        //reexecuteQuery({ requestPolicy: 'network-only' });
    }, []);

    //if (fetching) return <p>Loading...</p>;
    //if (error) return <p>Oh no... {error.message}</p>;

    //if (!data || !data.notices) return <p>No notices</p>;

    /* const notices: Notice[] = data.notices.edges.map((node: any) => {
        const n = node.node;
        let inputPayload = n?.input.payload;
        if (inputPayload) {
            try {
                inputPayload = ethers.utils.toUtf8String(inputPayload);
            } catch (e) {
                inputPayload = inputPayload + " (hex)";
            }
        } else {
            inputPayload = "(empty)";
        }
        let payload = n?.payload;
        if (payload) {
            try {
                payload = ethers.utils.toUtf8String(payload);
            } catch (e) {
                payload = payload + " (hex)";
            }
        } else {
            payload = "(empty)";
        }
        return {
            id: `${n?.id}`,
            index: parseInt(n?.index),
            payload: `${payload}`,
            input: n ? { index: n.input.index, payload: inputPayload } : {},
        };
    }).sort((b: any, a: any) => {
        if (a.input.index === b.input.index) {
            return b.index - a.index;
        } else {
            return b.input.index - a.input.index;
        }
    });
    */
    function payloadIsJSON(payload: any) {
        try {
            JSON.parse(payload);
            return true;
        } catch (e) {
            return false;
        }
    }

    // const forceUpdate = useForceUpdate();
    return (
        <Box >
            <Table>
                <Thead>
                    <Tr>
                        {/* <th>Input Index</th>
                        <th>Notice Index</th> */}
                        {/* <th>Input Payload</th> */}

                        <Th>Notices <Button size='xs' onClick={() => {
                            //reexecuteQuery({ requestPolicy: 'network-only' });
                            }}>🔃</Button>
                        </Th>
                        <Th></Th>
                    </Tr>
                </Thead>
                <Tbody>
                    {/* {notices.length === 0 && (
                        <Tr>
                            <Td colSpan={4}>-</Td>
                        </Tr>
                    )} 
                    {notices.map((n: any) => (
                        <Tr key={`${n.input.index}-${n.index}`}>

                            {/* Conditionally render deposit activity -- }
                            {payloadIsJSON(n.payload) ? (
                                JSON.parse(n.payload).type === "etherdeposit" ? (
                                    <Td color={'grey'}><Badge colorScheme="cyan">{JSON.parse(n.payload).type}</Badge></Td>
                                ) :
                                    JSON.parse(n.payload).type === "erc20deposit" ? (
                                        <Td color={'grey'}><Badge colorScheme="green">{JSON.parse(n.payload).type}</Badge></Td>
                                    ) :
                                        JSON.parse(n.payload).type === "erc721deposit" ? (
                                            <Td color={'grey'}><Badge colorScheme="purple">{JSON.parse(n.payload).type}</Badge> </Td>
                                        ) : (
                                            // Render something else for other JSON content
                                            <Td color={'grey'}>{JSON.stringify(n.payload)}</Td>
                                        )
                            ) : (
                                // Render if payload is not JSON
                                <Td color={'grey'}><Badge>DappAdressRelay</Badge></Td>
                            )}

                            {payloadIsJSON(n.payload) ? (
                                JSON.parse(n.payload).type === "etherdeposit" ? (
                                    <Td color={'grey'}> {ethers.utils.formatEther((JSON.parse(n.payload).content).amount)} Ξ deposited to ctsi account {(JSON.parse(n.payload).content).address} </Td>
                                ) :
                                    JSON.parse(n.payload).type === "erc20deposit" ? (
                                        <Td color={'grey'}> {ethers.utils.formatEther((JSON.parse(n.payload).content).amount)} amount deposited to ctsi account {(JSON.parse(n.payload).content).address}. ERC20 address {(JSON.parse(n.payload).content).erc20} </Td>
                                    ) :
                                        JSON.parse(n.payload).type === "erc721deposit" ? (
                                            <Td color={'grey'}> NFT address <Badge variant="outline">{(JSON.parse(n.payload).content).erc721}</Badge> and id {(JSON.parse(n.payload).content).token_id} transferred to ctsi account {(JSON.parse(n.payload).content).address}</Td>
                                        ) : (
                                            // Render something else for other JSON content
                                            <Td color={'grey'}>{JSON.stringify(n.payload)}</Td>
                                        )
                            ) : (
                                // Render if payload is not JSON
                                <Td color={'grey'}>{n.payload}</Td>
                            )}




                        </Tr>
                    ))} */}
                </Tbody>
            </Table>

        </Box>
    );
};
