import { Stack } from 'expo-router';
import { colors } from '../../components/design-tokens';

export default function UploadLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: colors.bgPrimary },
        headerTintColor: colors.accent,
        headerTitleStyle: { fontWeight: '500', color: colors.textPrimary },
      }}
    >
      <Stack.Screen name="review" options={{ title: 'Review Extraction', presentation: 'modal' }} />
    </Stack>
  );
}
