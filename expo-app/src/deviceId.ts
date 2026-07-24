import AsyncStorage from "@react-native-async-storage/async-storage";

const DEVICE_ID_KEY = "device_id";

let cached: string | null = null;

function generateId(): string {
  return `${Date.now().toString(36)}${Math.random().toString(36).slice(2)}${Math.random().toString(36).slice(2)}`;
}

/** Persistent anonymous device ID, used server-side to track repeat-offender reports. */
export async function getDeviceId(): Promise<string> {
  if (cached) return cached;
  const stored = await AsyncStorage.getItem(DEVICE_ID_KEY);
  if (stored) {
    cached = stored;
    return stored;
  }
  const id = generateId();
  await AsyncStorage.setItem(DEVICE_ID_KEY, id);
  cached = id;
  return id;
}
