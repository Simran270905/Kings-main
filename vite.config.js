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
          // Separate vendor chunks
          vendor: ['react', 'react-dom'],
          // Separate admin chunks
          admin: [
            './src/admin/AdminOnlyLayout.jsx',
            './src/admin/layout/Dashboard.jsx',
            './src/admin/context/useAdminAuth.jsx',
            './src/admin/context/AdminContextProvider.jsx',
          ],
          // Separate customer chunks
          customer: [
            './src/context/AuthContext.jsx',
            './src/context/ProductContext.jsx'
          ]
        }
      }
    },
    // Improve chunk size warning threshold
    chunkSizeWarningLimit: 1000,
    // Ensure proper code splitting
    sourcemap: false,
    // Optimize for production
    minify: 'esbuild',
    // Remove terserOptions since we're using esbuild
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
    }
  },

  preview: {
    port: 4173,
  }
})
