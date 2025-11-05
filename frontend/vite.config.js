import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {

    // Proxy requests starting with /api to the backend to avoid CORS and allow
    // the frontend to work with the backend "tal cual" (no backend changes).
    proxy: {
      // keep existing /api proxy (if used)

    port: 5173,
    open: true,
    proxy: {

      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        secure: false,

        rewrite: (path) => path.replace(/^\/api/, '/api')
      },
      // Proxy common backend endpoint prefixes (no backend change required)
      // This ensures frontend dev server handles client-side routes (e.g. /home)
      // and forwards API calls like /tarea/*, /sesion/*, etc. to Flask.
      '/tarea': { target: 'http://localhost:5000', changeOrigin: true, secure: false },
      '/sesion': { target: 'http://localhost:5000', changeOrigin: true, secure: false },
      '/sala': { target: 'http://localhost:5000', changeOrigin: true, secure: false },
      '/recompensa': { target: 'http://localhost:5000', changeOrigin: true, secure: false },
      '/usuario': { target: 'http://localhost:5000', changeOrigin: true, secure: false },
      '/progreso': { target: 'http://localhost:5000', changeOrigin: true, secure: false },
      '/auth': { target: 'http://localhost:5000', changeOrigin: true, secure: false }
    }
  }
})

      }
    }
  }
});

