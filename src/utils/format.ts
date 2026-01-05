import dayjs from 'dayjs';

/**
 * 格式化日期时间
 */
export function formatDateTime(dateTime: string): string {
  return dayjs(dateTime).format('YYYY-MM-DD HH:mm');
}

/**
 * 格式化日期
 */
export function formatDate(date: string): string {
  return dayjs(date).format('YYYY-MM-DD');
}

/**
 * 格式化时间
 */
export function formatTime(time: string): string {
  return dayjs(time, 'HH:mm').format('HH:mm');
}

/**
 * 生成唯一ID
 */
export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}
