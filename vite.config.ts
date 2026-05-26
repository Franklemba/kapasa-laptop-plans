import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    allowedHosts: [
      'localhost',
      '.onrender.com', // Allow all Render subdomains
      'fitech-cjyj.onrender.com', // Your specific Render URL
    ],
  },
  preview: {
    host: "::",
    port: 8080,
    allowedHosts: [
      'localhost',
      '.onrender.com',
      'fitech-cjyj.onrender.com',
    ],
  },
  plugins: [
    react({
      // Ensure production JSX runtime is used in production builds
      jsxRuntime: mode === 'production' ? 'automatic' : 'automatic',
    }),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: false, // Disable sourcemaps in production for smaller bundle
    minify: 'esbuild',
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'supabase-vendor': ['@supabase/supabase-js'],
          'ui-vendor': ['@radix-ui/react-dialog', '@radix-ui/react-select', '@radix-ui/react-tabs'],
        },
      },
    },
  },
}));


