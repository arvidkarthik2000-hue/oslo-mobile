/**
 * POC initialization — calls /auth/dev-create on first launch,
 * stores tokens, ensures demo user exists.
 */
import { useAuthStore } from '../store/auth';
import { seedDemoData } from './seed-demo-data';

const BASE_URL =
  process.env.EXPO_PUBLIC_API_URL || 'http://192.168.1.100:8000';

export async function initializeDemoUser(): Promise<boolean> {
  const { accessToken, setTokens, setActiveProfile } =
    useAuthStore.getState();

  // Already initialized
  if (accessToken) return true;

  try {
    const res = await fetch(`${BASE_URL}/auth/dev-create`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    });

    if (!res.ok) {
      console.error('dev-create failed:', res.status);
      return false;
    }

    const data = await res.json();
    setTokens(data.access_token, data.refresh_token, data.owner_id);
    setActiveProfile(data.profile_id);
    console.log('Demo user initialized:', data.owner_id);

    // Seed demo data on first launch
    seedDemoData();

    return true;
  } catch (err) {
    console.error('dev-create network error:', err);
    return false;
  }
}
