import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
  },
  plugins: [
    react({
      // Removes dev-only helpers in production
      babel: {
        compact: true,
      },
    }),
    tailwindcss(),
  ],

  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@config': path.resolve(__dirname, './src/config'),
      '@components': path.resolve(__dirname, './src/components'),
      '@customer': path.resolve(__dirname, './src/customer'),
      '@admin': path.resolve(__dirname, './src/admin'),
    },
  },

  build: {
    outDir: 'dist',

    // Faster & smaller builds
    minify: 'esbuild',
    sourcemap: false,

    rollupOptions: {
      output: {
        // Better caching: vendor code separated
        manualChunks: {
          vendor: ['react', 'react-dom'],
        },
      },
    },
  },

  // Speeds up dev server & rebuilds
  optimizeDeps: {
    include: ['react', 'react-dom'],
  },

  // Prevent caching issues in development
  server: {
    headers: {
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0'
    }
  }
})
