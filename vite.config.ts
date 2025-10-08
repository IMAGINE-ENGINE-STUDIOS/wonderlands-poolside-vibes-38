import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  base: './',
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
    mode === 'development' &&
    componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
    dedupe: ['react', 'react-dom'],
  },
  build: {
    cssCodeSplit: true,
    sourcemap: false,
    minify: 'esbuild',
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          // Single React vendor chunk - ALL React-dependent libraries MUST be here
          if (
            id.includes('node_modules/react') || 
            id.includes('node_modules/react-dom') || 
            id.includes('@tanstack/react-query') ||
            id.includes('@react-three') ||
            id.includes('@radix-ui') ||
            id.includes('react-router') ||
            id.includes('lucide-react')
          ) {
            return 'react-vendor';
          }
          
          // Supabase
          if (id.includes('@supabase')) {
            return 'data-vendor';
          }
          
          // Three.js core only (no React bindings)
          if (id.includes('node_modules/three/') && !id.includes('@react-three')) {
            return 'graphics-vendor';
          }
          
          // Utilities
          if (id.includes('date-fns') || id.includes('zod')) {
            return 'utils-vendor';
          }
          
          // Admin-related components
          if (id.includes('/components/Admin') || id.includes('/pages/AdminDashboard')) {
            return 'admin';
          }
          
          // Procurement system
          if (id.includes('/components/procurement') || id.includes('/pages/ProcurementSystem')) {
            return 'procurement';
          }
          
          // Pool-related components
          if (id.includes('/components/Pool') || id.includes('/components/Spa') || id.includes('/pages/PoolDetails')) {
            return 'pools';
          }
        },
        assetFileNames: (assetInfo) => {
          if (assetInfo.name && assetInfo.name.endsWith('.css')) {
            return 'assets/css/[name]-[hash][extname]';
          }
          return 'assets/[name]-[hash][extname]';
        },
        chunkFileNames: 'assets/js/[name]-[hash].js',
        entryFileNames: 'assets/js/[name]-[hash].js',
      }
    }
  }
}));
