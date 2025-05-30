import React, { useState } from 'react';
import { Box, Button, Text, VStack, Heading } from '@chakra-ui/react';

interface Application {
  id: string;
  name: string;
}

interface PaginationInfo {
  total_count: number;
  limit: number;
  offset: number;
}

interface RPCResponse {
  result?: {
    data: Application[];
    pagination: PaginationInfo;
  };
  error?: {
    message: string;
  };
}

const RPCReader: React.FC = () => {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [totalCount, setTotalCount] = useState<number | null>(null);

  const fetchApplications = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('http://127.0.0.1:8080/rpc', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          jsonrpc: '2.0',
          method: 'cartesi_listApplications',
          params: {
            limit: 20,
            offset: 0
          },
          id: 0,
        }),
      });

      const data = await response.json() as RPCResponse;
      
      if (data.error) {
        throw new Error(data.error.message || 'Failed to fetch applications');
      }

      if (data.result) {
        setApplications(data.result.data || []);
        setTotalCount(data.result.pagination.total_count);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
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
          {applications.map((app) => (
            <Box key={app.id} p={2} borderWidth={1} borderRadius="md">
              <Text>
                ID: {app.id} - Name: {app.name}
              </Text>
            </Box>
          ))}
        </VStack>
      )}
    </Box>
  );
};

export default RPCReader;
