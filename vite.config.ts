import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
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
  },
  build: {
    cssCodeSplit: true,
    sourcemap: false,
    minify: 'esbuild',
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          // Vendor chunk for React ecosystem
          if (id.includes('node_modules/react') || id.includes('node_modules/react-dom')) {
            return 'react-vendor';
          }
          
          // UI libraries chunk
          if (id.includes('@radix-ui') || id.includes('lucide-react')) {
            return 'ui-vendor';
          }
          
          // Supabase and query libraries
          if (id.includes('@supabase') || id.includes('@tanstack/react-query')) {
            return 'data-vendor';
          }
          
          // Three.js and heavy graphics libraries
          if (id.includes('three') || id.includes('@react-three')) {
            return 'graphics-vendor';
          }
          
          // Routing and utilities
          if (id.includes('react-router') || id.includes('date-fns') || id.includes('zod')) {
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
