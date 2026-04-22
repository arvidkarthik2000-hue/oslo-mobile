import { Stack } from 'expo-router';
import { colors } from '../../components/design-tokens';

export default function DocumentLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: colors.bgPrimary },
        headerTintColor: colors.accent,
        headerTitleStyle: { fontWeight: '500', color: colors.textPrimary },
      }}
    >
      <Stack.Screen name="[id]" options={{ title: 'Document Detail' }} />
    </Stack>
  );
}
