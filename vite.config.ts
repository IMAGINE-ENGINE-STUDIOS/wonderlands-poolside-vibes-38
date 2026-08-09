import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import fs from "fs";

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
    {
      name: 'chunk-graph-analyzer',
      generateBundle(_options: any, bundle: Record<string, any>) {
        const graph: Record<string, any> = {};
        for (const [fileName, chunk] of Object.entries(bundle)) {
          if (chunk.type !== 'chunk') continue;
          graph[fileName] = {
            imports: chunk.imports,
            modules: Object.keys(chunk.modules || {}),
          };
        }
        fs.writeFileSync('dist/chunk-graph.json', JSON.stringify(graph, null, 2));
      }
    }
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
          // The app has cross-chunk circular dependencies between the React/3D
          // stack and the catch-all vendor chunk. When those chunks execute in
          // the wrong order, React is undefined and hooks like createContext or
          // useLayoutEffect crash. To guarantee React is always available to its
          // consumers, everything that is not explicitly split out lives in the
          // same chunk as React. The separated chunks below only import from this
          // merged chunk, never the reverse, so no cycle remains.
          if (/@supabase/.test(id)) return 'vendor-supabase';
          if (/recharts|d3-/.test(id)) return 'vendor-charts';
          if (/jspdf|html2canvas|pdfjs/.test(id)) return 'vendor-pdf';
          if (/@radix-ui|embla|lucide-react/.test(id)) return 'vendor-ui';
          return 'vendor-react';
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
