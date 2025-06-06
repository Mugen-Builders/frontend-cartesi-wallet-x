import React from 'react';
import { useConnectWallet } from "@web3-onboard/react";
import { Box, Button, Heading, Stack, Text } from "@chakra-ui/react";

const Landing: React.FC = () => {
  const [{ wallet, connecting }, connect] = useConnectWallet();

  return (
    <Box mt='20' alignContent={"center"}>
      <Stack>
        <Heading>Welcome to Cartesi Wallet App! 💰</Heading>
        <Text color={'grey'}>
          Assets are integral part of apps on-chain. This web interface will guide you on how to bridge assets to and from a Cartesi rollups application. Play around and you'll learn a few tricks on how to build in-app wallets for App-chains. 🚀
        </Text>
        <Button
          onClick={() =>
            connect()
          }
        >
          {connecting ? "Connecting" : "Connect"}
        </Button>
      </Stack>
    </Box>
  );
};

export default Landing;
