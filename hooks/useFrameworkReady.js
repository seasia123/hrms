import { useEffect } from 'react';

export function useFrameworkReady() {
  useEffect(() => {
    // Framework initialization code
    // This hook is required for Expo Router 4.0+ to function properly
  }, []);
}