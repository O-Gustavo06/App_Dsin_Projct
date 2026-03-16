import AsyncStorage from '@react-native-async-storage/async-storage';

const AUTH_STORAGE_KEY = '@onpark_auth';

export async function saveAuthSession(session) {
  await AsyncStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(session));
}

export async function getAuthSession() {
  const raw = await AsyncStorage.getItem(AUTH_STORAGE_KEY);
  return raw ? JSON.parse(raw) : null;
}

export async function getSessionUserId() {
  const session = await getAuthSession();
  return session?.user?.id || 1;
}

export async function clearAuthSession() {
  await AsyncStorage.removeItem(AUTH_STORAGE_KEY);
}