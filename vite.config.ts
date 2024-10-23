import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    hmr: false,  // Disable HMR (Hot Module Replacement)
  },
  css: {
    modules: {
      scopeBehaviour: 'local',
    },
  },
  resolve: {
    alias: {
      '@mui/system': '@mui/system/esm',  // Alias to resolve MUI system issues
    },
  },
  optimizeDeps: {
    entries: [],  // Disable pre-bundling
  },
});
