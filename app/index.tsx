import { Redirect } from 'expo-router';
import { useAuthStore } from '../store/auth';

export default function Index() {
  const token = useAuthStore((s) => s.accessToken);

  // If logged in, go to tabs. Otherwise, onboarding.
  if (token) {
    return <Redirect href="/(tabs)/home" />;
  }
  return <Redirect href="/(auth)/onboarding" />;
}
