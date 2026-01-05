import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import 'antd/dist/reset.css'
import './index.css'
import { preventDoubleTapZoom } from './utils/mobile'

// 移动端优化：防止双击缩放
if (typeof window !== 'undefined') {
  preventDoubleTapZoom();
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
