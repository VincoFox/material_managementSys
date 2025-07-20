/**
 * 获取 YYYY-MM-DD HH:MM:SS 格式的时间字符串
 * @param date 可选的日期参数，默认为当前时间
 * @returns 格式化后的时间字符串
 */
export function getFormattedDateTime(date: Date = new Date()): string {
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, '0');
  const day = String(date.getUTCDate()).padStart(2, '0');
  const hours = String(date.getUTCHours()).padStart(2, '0');
  const minutes = String(date.getUTCMinutes()).padStart(2, '0');
  const seconds = String(date.getUTCSeconds()).padStart(2, '0');

  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}
/**
 * 获取 YYYY-MM-DD 格式的时间字符串
 * @param date 日期参数
 * @returns 格式化后的时间字符串
 */
export function getFormattedDate(date: Date): string {
  if (!date) return '--';
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}

export function getYYYYMMDDFormat(date: Date = new Date()): string {
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, '0');
  const day = String(date.getUTCDate()).padStart(2, '0');
  return `${year}${month}${day}`;
}
