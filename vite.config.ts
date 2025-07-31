import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc'; // <-- MUST BE THIS ONE FOR .TS CONFIG

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 1420,
    strictPort: true,
  },
  build: {
    outDir: './dist',
    emptyOutDir: true,
  }
});
