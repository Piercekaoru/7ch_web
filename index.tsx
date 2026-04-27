import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
// 初始化 i18n（必须在渲染前完成资源注入）。
// Initialize i18n before rendering.
import './i18n';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider } from './components/theme-provider';
import { ExternalLinkWarningProvider } from './components/ExternalLinkWarning';

// 应用挂载点：Vite 默认注入 #root。
// App mount point: Vite injects #root by default.
const rootElement = document.getElementById('root');
if (!rootElement) throw new Error('Root not found');

// React 19 推荐的 createRoot + StrictMode。
// React 19 recommended createRoot + StrictMode.
const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <ThemeProvider>
      <BrowserRouter>
        <ExternalLinkWarningProvider>
          <App />
        </ExternalLinkWarningProvider>
      </BrowserRouter>
    </ThemeProvider>
  </React.StrictMode>
);
