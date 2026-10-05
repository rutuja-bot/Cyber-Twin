import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    {
      name: 'transform-cjs-visualization',
      transform(code, id) {
        if (id.includes('dataAdapter.js') || id.includes('graphElements.js') || id.includes('replayEngine.js') || id.includes('attackPath.js') || id.includes('cyberTwin3D.js')) {
          return {
            code: `let module = { exports: {} }; let exports = module.exports;\n` +
              code.replace(/module\.exports\s*=\s*\{([\s\S]*?)\};/, (match, inner) => {
                const keys = inner.split(',').map(k => k.trim()).filter(Boolean);
                return `const __exports = { ${keys.join(', ')} };\nexport default __exports;\nexport { ${keys.join(', ')} };\nmodule.exports = __exports;`;
              }),
            map: null
          };
        }
      }
    }
  ],
  server: {
    port: 5174
  }
});
