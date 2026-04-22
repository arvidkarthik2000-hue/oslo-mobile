import { Stack } from 'expo-router';
import { colors } from '../../components/design-tokens';

export default function TimelineLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.bgPrimary },
      }}
    >
      <Stack.Screen name="add-note" options={{ presentation: 'modal' }} />
    </Stack>
  );
}
