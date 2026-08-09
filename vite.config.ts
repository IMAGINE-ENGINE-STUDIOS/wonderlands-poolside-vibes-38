import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  base: '/',
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
    dedupe: [
      "react",
      "react-dom",
      "react/jsx-runtime",
      // A second copy of three used to be pulled in through drei/postprocessing,
      // shipping the engine twice and warning at runtime.
      "three",
      "@react-three/fiber",
    ],
  },
  build: {
    cssCodeSplit: false,
    sourcemap: false,
    minify: 'esbuild',
    target: 'es2020',
    chunkSizeWarningLimit: 1200,
    rollupOptions: {
      output: {
        // Split the heavy, rarely-changing libraries out of the entry chunk so
        // the first screen does not wait on 3D/chart/PDF code it never uses.
        manualChunks: (id) => {
          if (!id.includes('node_modules')) return undefined;
          // The 3D stack (three, r3f, cesium, etc.) and React must not form a
          // cross-chunk cycle. We keep React in vendor-react, put the entire 3D
          // stack in vendor-3d, and leave the rest in vendor. vendor-3d imports
          // utilities (zustand, suspend-react, etc.) from vendor, and vendor
          // imports React from vendor-react; no chunk imports back towards its
          // dependents, so ESM can initialize React before any consumer runs.
          if (/react-dom|scheduler|\/react\//.test(id)) return 'vendor-react';
          if (/three|@react-three|postprocessing|n8ao|camera-controls|maath|meshline|stats-gl|@monogrid\/gainmap-js|@react-spring\/three|troika-three|three-mesh-bvh|three-stdlib|three-bvh-csg|@cesium\/engine|resium|cesium/.test(id)) return 'vendor-3d';
          if (/@supabase/.test(id)) return 'vendor-supabase';
          if (/recharts|d3-/.test(id)) return 'vendor-charts';
          if (/jspdf|html2canvas|pdfjs/.test(id)) return 'vendor-pdf';
          if (/@radix-ui|embla|lucide-react/.test(id)) return 'vendor-ui';
          return 'vendor';
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
