import { getNetworkStateAsync, useNetworkState } from "expo-network";

export function useNetworkStatus() {
  const networkState = useNetworkState();

  return {
    isOnline:
      networkState.isConnected === true &&
      networkState.isInternetReachable !== false,
    isOnlineNow: async () => {
      const currentState = await getNetworkStateAsync();
      return (
        currentState.isConnected === true &&
        currentState.isInternetReachable !== false
      );
    },
  };
}
