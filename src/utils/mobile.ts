/**
 * 移动端工具函数
 */

/**
 * 检测是否为移动设备
 */
export function isMobile(): boolean {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  ) || window.innerWidth <= 768;
}

/**
 * 获取移动端屏幕信息
 */
export function getMobileInfo() {
  return {
    isMobile: isMobile(),
    width: window.innerWidth,
    height: window.innerHeight,
    isIOS: /iPad|iPhone|iPod/.test(navigator.userAgent),
    isAndroid: /Android/.test(navigator.userAgent)
  };
}

/**
 * 防止iOS双击缩放
 */
export function preventDoubleTapZoom() {
  let lastTouchEnd = 0;
  document.addEventListener('touchend', (event) => {
    const now = Date.now();
    if (now - lastTouchEnd <= 300) {
      event.preventDefault();
    }
    lastTouchEnd = now;
  }, false);
}
