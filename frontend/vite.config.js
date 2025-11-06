import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    open: true,
    proxy: {
      // Forward API calls to backend during development
      '^/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/api/, '/api')
      },
      '/tarea': { target: 'http://localhost:5000', changeOrigin: true, secure: false },
      '/sesion': { target: 'http://localhost:5000', changeOrigin: true, secure: false },
      '/sala': { target: 'http://localhost:5000', changeOrigin: true, secure: false },
      '/recompensa': { target: 'http://localhost:5000', changeOrigin: true, secure: false },
      '/usuario': { target: 'http://localhost:5000', changeOrigin: true, secure: false },
      '/progreso': { target: 'http://localhost:5000', changeOrigin: true, secure: false },
      '/auth': { target: 'http://localhost:5000', changeOrigin: true, secure: false }
    }
  }
});

