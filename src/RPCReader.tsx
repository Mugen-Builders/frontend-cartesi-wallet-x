import React, { useState } from 'react';
import { Box, Button, Text, VStack, Heading, HStack, Accordion, AccordionItem, AccordionButton, AccordionPanel, AccordionIcon } from '@chakra-ui/react';
import { type Application, type Output as CartesiOutput, type Report } from "@cartesi/viem";
import configFile from "./config.json";
import { getL2Client } from './utils/chain';

const config: any = configFile;

const RPCReader: React.FC = () => {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [totalCount, setTotalCount] = useState<number | null>(null);
  const [outputs, setOutputs] = useState<Record<string, CartesiOutput[]>>({});
  const [reports, setReports] = useState<Record<string, Report[]>>({});
  const [loadingOutputs, setLoadingOutputs] = useState<Record<string, boolean>>({});
  const [loadingReports, setLoadingReports] = useState<Record<string, boolean>>({});

  const fetchApplications = async () => {
    setLoading(true);
    setError(null);
    try {
      // Create Cartesi client using the local development network with /rpc endpoint
      const rpcUrl = `${config["0x343a"].inspectAPIURL}/rpc`;
      const client = await getL2Client(rpcUrl);
      if (!client) {
        throw new Error('Failed to create Cartesi client');
      }

      // Get applications using the Cartesi client
      const result = await client.listApplications({
        limit: 20,
        offset: 0
      });

      setApplications(result.data || []);
      setTotalCount(result.pagination.totalCount);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const fetchOutputs = async (applicationAddress: string) => {
    setLoadingOutputs(prev => ({ ...prev, [applicationAddress]: true }));
    try {
      const rpcUrl = `${config["0x343a"].inspectAPIURL}/rpc`;
      const client = await getL2Client(rpcUrl);
      if (!client) {
        throw new Error('Failed to create Cartesi client');
      }

      const result = await client.listOutputs({
        application: applicationAddress,
        limit: 20,
        offset: 0
      });

      setOutputs(prev => ({
        ...prev,
        [applicationAddress]: result.data || []
      }));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoadingOutputs(prev => ({ ...prev, [applicationAddress]: false }));
    }
  };

  const fetchReports = async (applicationAddress: string) => {
    setLoadingReports(prev => ({ ...prev, [applicationAddress]: true }));
    try {
      const rpcUrl = `${config["0x343a"].inspectAPIURL}/rpc`;
      const client = await getL2Client(rpcUrl);
      if (!client) {
        throw new Error('Failed to create Cartesi client');
      }

      const result = await client.listReports({
        application: applicationAddress,
        limit: 20,
        offset: 0
      });

      setReports(prev => ({
        ...prev,
        [applicationAddress]: result.data || []
      }));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoadingReports(prev => ({ ...prev, [applicationAddress]: false }));
    }
  };

  return (
    <Box p={4}>
      <Heading size="md" mb={4}>
        Cartesi Applications Reader
      </Heading>
      
      <Button 
        colorScheme="blue"
        onClick={fetchApplications}
        isLoading={loading}
        mb={4}
      >
        List Applications
      </Button>

      {error && (
        <Text color="red.500" mb={4}>
          Error: {error}
        </Text>
      )}

      {totalCount !== null && (
        <VStack align="stretch" spacing={2}>
          <Heading size="sm">
            {totalCount === 0 
              ? "No applications found" 
              : `Found ${totalCount} application(s):`}
          </Heading>
          <Accordion allowMultiple>
            {applications.map((app) => (
              <AccordionItem key={app.name}>
                <h2>
                  <AccordionButton>
                    <Box flex="1" textAlign="left">
                      <HStack justify="space-between">
                        <Text>{app.name}: {app.applicationAddress}</Text>
                        <HStack spacing={2}>
                          <Button
                            size="sm"
                            colorScheme="blue"
                            onClick={(e) => {
                              e.stopPropagation();
                              fetchOutputs(app.applicationAddress);
                            }}
                            isLoading={loadingOutputs[app.applicationAddress]}
                          >
                            Outputs
                          </Button>
                          <Button
                            size="sm"
                            colorScheme="green"
                            onClick={(e) => {
                              e.stopPropagation();
                              fetchReports(app.applicationAddress);
                            }}
                            isLoading={loadingReports[app.applicationAddress]}
                          >
                            Reports
                          </Button>
                        </HStack>
                      </HStack>
                    </Box>
                    <AccordionIcon />
                  </AccordionButton>
                </h2>
                <AccordionPanel pb={4}>
                  <VStack align="stretch" spacing={4}>
                    {outputs[app.applicationAddress]?.length > 0 && (
                      <Box>
                        <Heading size="xs" mb={2}>Outputs:</Heading>
                        <VStack align="stretch" spacing={2}>
                          {outputs[app.applicationAddress].map((output) => (
                            <Box key={output.index} p={2} borderWidth={1} borderRadius="md">
                              <Text>Index: {output.index.toString()}</Text>
                              <Text>Input Index: {output.inputIndex.toString()}</Text>
                              <Text>Data: {JSON.stringify(output.decodedData)}</Text>
                            </Box>
                          ))}
                        </VStack>
                      </Box>
                    )}
                    {reports[app.applicationAddress]?.length > 0 && (
                      <Box>
                        <Heading size="xs" mb={2}>Reports:</Heading>
                        <VStack align="stretch" spacing={2}>
                          {reports[app.applicationAddress].map((report) => (
                            <Box key={report.index} p={2} borderWidth={1} borderRadius="md">
                              <Text>Index: {report.index.toString()}</Text>
                              <Text>Input Index: {report.inputIndex.toString()}</Text>
                              <Text>Payload: {report.rawData}</Text>
                            </Box>
                          ))}
                        </VStack>
                      </Box>
                    )}
                    {(!outputs[app.applicationAddress]?.length && !reports[app.applicationAddress]?.length) && (
                      <Text color="gray.500">No outputs or reports found</Text>
                    )}
                  </VStack>
                </AccordionPanel>
              </AccordionItem>
            ))}
          </Accordion>
        </VStack>
      )}
    </Box>
  );
};

export default RPCReader;
