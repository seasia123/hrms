// layouts/HomeLayout.js
import { Stack } from 'expo-router';

export default function HomeLayout() {
  return (
    <Stack screenOptions={{ headerShown: true }}>
      <Stack.Screen name="index" options={{ title: 'Home' }} />
      <Stack.Screen name="FilesPreview" options={{ title: 'Another Screen' }} />
      {/* Add more screens as needed */}
    </Stack>
  );
}
