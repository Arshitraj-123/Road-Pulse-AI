import useThemeStore from '../../store/useThemeStore';
import { motion, AnimatePresence } from 'framer-motion';
import { Sun, Moon } from 'lucide-react';

export default function ThemeToggle() {
  const { theme, toggleTheme } = useThemeStore();
  const isDark = theme === 'dark';

  return (
    <motion.button
      onClick={toggleTheme}
      whileTap={{ scale: 0.92 }}
      aria-label="Toggle dark mode"
      style={{
        width: 40,
        height: 40,
        borderRadius: 10,
        border: '1px solid',
        borderColor: isDark
          ? 'rgba(255,255,255,0.15)'
          : 'rgba(4,44,83,0.15)',
        background: isDark
          ? 'rgba(255,255,255,0.08)'
          : 'rgba(4,44,83,0.06)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        flexShrink: 0,
      }}
    >
      <AnimatePresence mode="wait" initial={false}>
        {isDark ? (
          <motion.div
            key="sun"
            initial={{ rotate: -90, opacity: 0 }}
            animate={{ rotate: 0, opacity: 1 }}
            exit={{ rotate: 90, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <Sun size={18} color="#FAC775" />
          </motion.div>
        ) : (
          <motion.div
            key="moon"
            initial={{ rotate: 90, opacity: 0 }}
            animate={{ rotate: 0, opacity: 1 }}
            exit={{ rotate: -90, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <Moon size={18} color="#185FA5" />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.button>
  );
}
