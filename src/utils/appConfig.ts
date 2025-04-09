
/**
 * 配置文件
 */
export const appConfig = {
  appName: process.env.NEXT_PUBLIC_APP_NAME,
  apiBaseUrl: process.env.NEXT_PUBLIC_API_BASE_URL,
  deepSeekBaseUrl: process.env.NEXT_PUBLIC_DEEPSEEK_BASE_URL || '',
  deepSeekApiKey: process.env.NEXT_PUBLIC_DEEPSEEK_API_KEY,
}