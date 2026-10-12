
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { palette } from '../theme';

export default function RootLayout() {
  return (
    <>
      <StatusBar style="dark" />

      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: {
            backgroundColor: palette.background,
          },
          animation: 'fade',
        }}
      >
        <Stack.Screen name="index" />
        <Stack.Screen name="game" />
        <Stack.Screen name="gameover" />
        <Stack.Screen name="credits" />
      </Stack>
    </>
  );
}
