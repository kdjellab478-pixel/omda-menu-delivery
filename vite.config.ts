import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
// import componentTagger from "lovable-tagger"; // ❌ لا تستخدم هذا السطر

// استخدم طريقة استيراد ديناميكية أو شرطية للإضافة
const componentTagger = (await import("lovable-tagger")).default;

// https://vitejs.dev/config/
export default defineConfig({
  // هذا السطر يحل مشكلة المسارات (404) على GitHub Pages
  base: './', 
  
  server: {
    host: "*.*",
    port: 8080,
  },
  plugins: [
    react(), 
    mode => (mode === 'development' && componentTagger() || false) as any 
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
