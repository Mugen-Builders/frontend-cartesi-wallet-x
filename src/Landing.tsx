import React from 'react';
import { useConnectWallet } from "@web3-onboard/react";
import { Box, Button, Heading, Stack, Text } from "@chakra-ui/react";

const Landing: React.FC = () => {
  const [{ wallet, connecting }, connect] = useConnectWallet();

  return (
    <Box mt='20' alignContent={"center"}>
      <Stack>
        <Heading>Welcome to Cartesi Wallet dApp! 💰</Heading>
        <Text color={'grey'}>
          Assets are paramount for the functioning of dApps on-chain. This web interface will guide you on how to deposit and withdraw assets from a Cartesi rollups dApp. Play around and you'll learn a few tricks on how to build wallets for dApp chains. 🚀
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
