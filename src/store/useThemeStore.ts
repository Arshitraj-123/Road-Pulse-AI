import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface ThemeState {
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  initTheme: () => void;
}

const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      theme: 'light',
      toggleTheme: () =>
        set((state) => {
          const next = state.theme === 'light' ? 'dark' : 'light';
          if (typeof document !== 'undefined') {
            document.documentElement.classList.toggle('dark', next === 'dark');
          }
          return { theme: next };
        }),
      initTheme: () =>
        set((state) => {
          if (typeof document !== 'undefined') {
            document.documentElement.classList.toggle('dark', state.theme === 'dark');
          }
          return {};
        }),
    }),
    { name: 'rp-theme' }
  )
);

export default useThemeStore;
