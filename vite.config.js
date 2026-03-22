import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

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
})
