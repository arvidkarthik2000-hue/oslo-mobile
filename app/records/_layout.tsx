import { Stack } from 'expo-router';
import { colors } from '../../components/design-tokens';

export default function RecordsLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.bgPrimary },
      }}
    >
      <Stack.Screen name="[category]" />
    </Stack>
  );
}
