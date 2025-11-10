import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
// ❌ أزل هذا السطر: import componentTagger from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig({
  // ✅ أضف هذا السطر لـ GitHub Pages
  base: './', 
  
  server: {
    host: "*.*",
    port: 8080,
  },
  // ❌ أزل الإضافة من قائمة plugins مؤقتاً
  plugins: [react()], 
  
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
