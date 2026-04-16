import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

export default defineConfig({
  base: '/',
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
    // Optimize chunk splitting for better loading
    rollupOptions: {
      output: {
        manualChunks: {
          // Core React chunk - stable for caching
          react: ['react', 'react-dom'],
          // Router chunk - frequently used
          router: ['react-router-dom'],
          // UI Library chunks
          ui: ['@headlessui/react', '@heroicons/react'],
          // MUI chunk - heavy library
          mui: ['@mui/material', '@mui/icons-material'],
          // Chart library chunk
          charts: ['recharts'],
          // Admin chunks
          admin: [
            './src/admin/AdminOnlyLayout.jsx',
            './src/admin/layout/Dashboard.jsx',
            './src/admin/context/useAdminAuth.jsx',
            './src/admin/context/AdminContextProvider.jsx',
          ],
          // Customer chunks
          customer: [
            './src/context/AuthContext.jsx',
            './src/context/ProductContext.jsx'
          ]
        },
        // Optimize chunk naming for better caching
        chunkFileNames: (chunkInfo) => {
          const facadeModuleId = chunkInfo.facadeModuleId ? chunkInfo.facadeModuleId.split('/').pop() : 'chunk';
          return `assets/[name]-[hash].js`;
        }
      }
    },
    // Improve chunk size warning threshold
    chunkSizeWarningLimit: 1000,
    // Ensure proper code splitting
    sourcemap: false,
    // Optimize for production
    minify: 'esbuild',
    // Enable compression for better load times
    target: 'esnext'
  },

  // Speeds up dev server & rebuilds
  optimizeDeps: {
    include: ['react', 'react-dom'],
  },

  server: {
    headers: {
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0'
    },
    fs: {
      strict: false,
    },
    proxy: {
      '/api': {
        target: 'http://localhost:5001',
        changeOrigin: true,
        secure: false
      }
    }
  },

  preview: {
    port: 4173,
  }
})
