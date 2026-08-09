import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { useEffect, useRef, useState } from "react";
import { AppState, View } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { logVisit } from "../src/analytics";
import { TermsGateModal } from "../src/components/TermsGateModal";

const TERMS_VERSION = "2026-07-22";
const TERMS_KEY = "terms_accepted_version";

async function isTermsAccepted(): Promise<boolean> {
  const accepted = await AsyncStorage.getItem(TERMS_KEY);
  return accepted === TERMS_VERSION;
}

export default function RootLayout() {
  // null = 아직 확인 전(아무것도 렌더링하지 않음), true = 동의 완료, false = 동의 필요
  const [accepted, setAccepted] = useState<boolean | null>(null);
  const appState = useRef(AppState.currentState);

  useEffect(() => {
    logVisit();
    isTermsAccepted().then(setAccepted);

    // 약관/개인정보처리방침 보러 앱을 나갔다가 돌아온 경우에도
    // 동의 여부를 다시 확인한다.
    const subscription = AppState.addEventListener("change", async (nextState) => {
      if (appState.current.match(/inactive|background/) && nextState === "active") {
        setAccepted(await isTermsAccepted());
      }
      appState.current = nextState;
    });
    return () => subscription.remove();
  }, []);

  function handleAccept() {
    AsyncStorage.setItem(TERMS_KEY, TERMS_VERSION);
    setAccepted(true);
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <StatusBar style="dark" />
      {accepted === null ? (
        // 동의 여부 확인 전에는 앱 화면을 마운트하지 않는다.
        <View style={{ flex: 1, backgroundColor: "#f0f0ee" }} />
      ) : accepted ? (
        <Stack screenOptions={{ headerShown: false }} />
      ) : (
        <TermsGateModal visible onAccept={handleAccept} />
      )}
    </GestureHandlerRootView>
  );
}
