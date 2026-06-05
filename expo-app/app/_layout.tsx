import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

export default function RootLayout() {
  return (
    <>
      <StatusBar style="dark" backgroundColor="#f0f0ee" />
      <Stack screenOptions={{ headerShown: false }} />
    </>
  );
}
