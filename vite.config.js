import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import dotenv from 'dotenv';

// Cargar variables de entorno desde el archivo .env
dotenv.config();

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      "/api": {
        target: `http://localhost:${process.env.PORT || 8080}`, // Usa el puerto definido en .env o un valor por defecto
        changeOrigin: true, // Cambia el origen de la solicitud para evitar problemas de CORS
        secure: false, // Desactiva si usas HTTPS con certificados no válidos
      },
    },
  },
});
