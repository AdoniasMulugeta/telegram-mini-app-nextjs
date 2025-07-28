import { initDataRaw } from '@telegram-apps/sdk-react';

// Simple fetch wrapper that adds Telegram initData to every request
export default async function apiRequest(url: string, options?: RequestInit) {
  const rawData = initDataRaw();
  
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options?.headers as Record<string, string> || {}),
  };
  
  // Always add Authorization header with initData
  if (rawData) {
    headers['Authorization'] = `tma ${rawData}`;
  }
  
  const response = await fetch(url, {
    ...options,
    headers,
  });
  
  const data = await response.json();
  
  if (!response.ok) {
    throw new Error(data.error || `Request failed: ${response.status}`);
  }
  
  return data;
}