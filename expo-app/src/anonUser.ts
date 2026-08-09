import AsyncStorage from "@react-native-async-storage/async-storage";

const USER_ID_KEY = "anon_user_id";

function generateId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}-${Math.random().toString(36).slice(2, 10)}`;
}

export async function getOrCreateUserId(): Promise<string> {
  const existing = await AsyncStorage.getItem(USER_ID_KEY);
  if (existing) return existing;

  const id = generateId();
  await AsyncStorage.setItem(USER_ID_KEY, id);
  return id;
}
