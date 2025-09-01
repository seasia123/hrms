import { useEffect, useState } from 'react';
import * as Network from 'expo-network';

const useNetworkStatus = () => {
  const [isConnected, setIsConnected] = useState(true); // Assume initially connected

  useEffect(() => {
    const checkInternetConnection = async () => {
      const state = await Network.getNetworkStateAsync();
      setIsConnected(state.isConnected);
    };

    const handleConnectivityChange = async () => {
      const state = await Network.getNetworkStateAsync();
      setIsConnected(state.isConnected);
    };

    checkInternetConnection(); // Check once when the component mounts
    const intervalId = setInterval(handleConnectivityChange, 3000); // Check every 3 seconds

    return () => clearInterval(intervalId);
  }, []);

  return isConnected;
};

export default useNetworkStatus;
