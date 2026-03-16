const DEFAULT_API_URL = 'http://10.1.32.105:8000';

const configuredApiUrl = (process.env.EXPO_PUBLIC_API_URL || DEFAULT_API_URL).trim();

export const API_BASE_URL = configuredApiUrl.replace(/\/+$/, '');