import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { viteSingleFile } from 'vite-plugin-singlefile';

// Tek dosyalık çıktı: dist/index.html — çift tıklayarak (internet olmadan) açılabilir,
// istenirse herhangi bir statik sunucuya (GitHub Pages, Netlify...) da konabilir.
export default defineConfig({
  base: './',
  plugins: [react(), viteSingleFile()],
  server: { port: 5173 },
});
