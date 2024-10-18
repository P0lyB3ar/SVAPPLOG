import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server:{
    port: 5173,
    hmr: false,  // Add this line to disable HMR
  },
  css: {
    modules: {
      scopeBehaviour: 'local'
    }
  }
});
