import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // The API key is now securely sourced from environment variables.
  // Make sure to set the API_KEY environment variable in your deployment environment.
  define: {
    'process.env.API_KEY': JSON.stringify(process.env.API_KEY)
  },
  build: {
    rollupOptions: {
      external: (id) => {
        const externals = [
          'react',
          'react-dom',
          'react-hot-toast',
          'reactflow',
          'html-to-image',
          '@reactflow/react',
          '@google/genai',
          'lucide-react'
        ];
        // Check if the import ID is one of the externals or starts with one followed by a slash.
        return externals.some(pkg => id === pkg || id.startsWith(`${pkg}/`));
      }
    }
  }
});