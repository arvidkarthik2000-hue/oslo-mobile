import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface AuthState {
  accessToken: string | null;
  refreshToken: string | null;
  ownerId: string | null;
  activeProfileId: string | null;
  profileName: string | null;
  isNewUser: boolean;
  setTokens: (access: string, refresh: string, ownerId: string) => void;
  setActiveProfile: (profileId: string) => void;
  setProfileName: (name: string) => void;
  setIsNewUser: (v: boolean) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      accessToken: null,
      refreshToken: null,
      ownerId: null,
      activeProfileId: null,
      profileName: null,
      isNewUser: false,
      setTokens: (access, refresh, ownerId) =>
        set({ accessToken: access, refreshToken: refresh, ownerId }),
      setActiveProfile: (profileId) => set({ activeProfileId: profileId }),
      setProfileName: (name) => set({ profileName: name }),
      setIsNewUser: (v) => set({ isNewUser: v }),
      logout: () =>
        set({
          accessToken: null,
          refreshToken: null,
          ownerId: null,
          activeProfileId: null,
        }),
    }),
    {
      name: 'oslo-auth',
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
