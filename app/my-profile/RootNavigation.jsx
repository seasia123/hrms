// layouts/HomeLayout.js or navigation/HomeLayout.js
import { Stack } from 'expo-router';

export default function RootNavigation() {
  return (
    <Stack screenOptions={{ headerShown: true }}>
      <Stack.Screen name="index" options={{ title: 'Home' }} />
      <Stack.Screen name="FilesPreview" options={{ title: 'Files Preview' }} />
      <Stack.Screen name="AnotherScreen" options={{ title: 'Another Screen' }} />
      {/* Add more screens as needed */}
    </Stack>
  );
}
