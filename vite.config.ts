import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

const projectRoot = path.resolve(__dirname, '.');

const parseBoolean = (value: string | undefined) => {
  if (value === undefined) return undefined;
  return value === '1' || value.toLowerCase() === 'true';
};

const parsePositiveInteger = (value: string | undefined, fallback: number) => {
  const parsed = Number.parseInt(value ?? '', 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
};

// Vite 配置：开发服务器、别名与环境变量注入。
// Vite config: dev server, aliases, and env injections.
export default defineConfig(({ mode }) => {
  // 读取对应模式的环境变量（.env, .env.local 等）。
  // Load env variables for the current mode.
  const env = loadEnv(mode, projectRoot, '');
  const isMountedVolume = projectRoot.startsWith('/Volumes/');
  const usePolling = parseBoolean(env.VITE_USE_POLLING) ?? isMountedVolume;
  const watchInterval = parsePositiveInteger(env.VITE_POLLING_INTERVAL, 150);

  return {
    server: {
      port: 3000,
      // 默认只监听本机，避免不必要的网卡枚举；需要局域网访问时可通过 VITE_DEV_HOST=0.0.0.0 覆盖。
      // Bind to localhost by default; override with VITE_DEV_HOST=0.0.0.0 for LAN access.
      host: env.VITE_DEV_HOST || '127.0.0.1',
      strictPort: true,
      // 外置卷上的原生文件事件更容易抖动，改用 polling 规避 bus error / 丢事件问题。
      // Mounted volumes can be flaky with native file events, so use polling there.
      watch: {
        ignored: ['**/.git/**', '**/node_modules/**', '**/dist/**'],
        ...(usePolling
          ? {
              usePolling: true,
              interval: watchInterval,
              awaitWriteFinish: {
                stabilityThreshold: Math.max(watchInterval * 2, 300),
                pollInterval: watchInterval,
              },
            }
          : {}),
      },
    },
    plugins: [react()],
    define: {
      // 兼容旧代码：在浏览器端注入 API key 常量。
      // Legacy compatibility: inject API key constants on the client.
      'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY),
    },
    resolve: {
      alias: {
        '@': projectRoot,
      },
    },
  };
});
