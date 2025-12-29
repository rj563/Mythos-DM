import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  const env = loadEnv(mode, (process as any).cwd(), '');

  return {
    plugins: [
      react(),
      tailwindcss()
    ],
    define: {
      // This allows the app to access process.env.API_KEY in the browser
      'process.env.API_KEY': JSON.stringify(env.API_KEY),
      // Polyfill for Gun.js which expects 'global' to exist
      'global': 'window',
    },
    build: {
      chunkSizeWarningLimit: 1000,
      rollupOptions: {
        output: {
          manualChunks: {
            'react-vendor': ['react', 'react-dom'],
            'genai': ['@google/genai'],
            'firebase-vendor': ['firebase/app', 'firebase/auth', 'firebase/firestore'],
            'ui-vendor': ['lucide-react', 'react-markdown'],
            'gun': ['gun']
          }
        }
      }
    }
  };
});