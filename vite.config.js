import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { nodeAdapter } from 'vite-plugin-mix'
import mixPlugin from 'vite-plugin-mix'
const mix = mixPlugin.default

// https://vitejs.dev/config/
export default defineConfig({ 
  base: "./",
  build: {
    // generate .vite/manifest.json in outDir
    manifest: true,
    rollupOptions: {
      // overwrite default .html entry
      input: './src/main.jsx',
    },
  },
  plugins: [
    react(),
    mix({
      handler: './server/index.js',
      adapter: nodeAdapter()
    })],
})
