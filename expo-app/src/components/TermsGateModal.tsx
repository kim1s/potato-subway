import { useEffect, useRef, useState } from "react";
import {
  Animated,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import * as WebBrowser from "expo-web-browser";
import { Feather } from "@expo/vector-icons";

const TEXT = "#111";
const MUTED = "#888";
const BORDER = "#e8e8e6";

const TERMS_URL = "https://potato-subway.vercel.app/terms";
const PRIVACY_URL = "https://potato-subway.vercel.app/privacy";

interface Props {
  visible: boolean;
  onAccept: () => void;
}

export function TermsGateModal({ visible, onAccept }: Props) {
  const [agreed, setAgreed] = useState(false);
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      setAgreed(false);
      Animated.timing(opacityAnim, { toValue: 1, duration: 200, useNativeDriver: true }).start();
    }
  }, [visible]);

  if (!visible) return null;

  return (
    <Modal transparent animationType="none" visible={visible}>
      <Animated.View style={[s.backdrop, { opacity: opacityAnim }]}>
        <View style={s.sheet}>
          <Text style={s.title}>시작하기 전에</Text>
          <ScrollView style={s.body} contentContainerStyle={s.bodyContent}>
            <Text style={s.paragraph}>
              &ldquo;Potato on the Subway&rdquo;는 누구나 익명으로 댓글을 남길 수 있는 서비스입니다.
            </Text>
            <Text style={s.paragraph}>
              스팸, 욕설, 혐오 표현, 음란물 등 부적절한 콘텐츠는 무관용 원칙으로 처리됩니다. 댓글이 신고되면
              즉시 영구 삭제되며, 신고 누적 3회 이상인 사용자는 댓글 작성 권한이 영구적으로 제한됩니다.
              마음에 들지 않는 사용자는 언제든 차단할 수 있습니다.
            </Text>
            <Text style={s.paragraph}>
              서비스를 계속 이용하려면 아래 이용약관과 개인정보처리방침에 동의해야 합니다.
            </Text>
            <View style={s.linkRow}>
              <Pressable onPress={() => WebBrowser.openBrowserAsync(TERMS_URL)}>
                <Text style={s.link}>이용약관 전문 보기</Text>
              </Pressable>
              <Pressable onPress={() => WebBrowser.openBrowserAsync(PRIVACY_URL)}>
                <Text style={s.link}>개인정보처리방침 보기</Text>
              </Pressable>
            </View>
          </ScrollView>

          <Pressable style={s.agreeRow} onPress={() => setAgreed((v) => !v)}>
            <View style={[s.checkbox, agreed && s.checkboxChecked]}>
              {agreed && <Feather name="check" size={12} color="#fff" />}
            </View>
            <Text style={s.agreeText}>위 내용에 동의합니다</Text>
          </Pressable>

          <Pressable
            style={[s.submitBtn, !agreed && s.submitBtnDisabled]}
            disabled={!agreed}
            onPress={onAccept}
          >
            <Text style={s.submitBtnText}>동의하고 시작하기</Text>
          </Pressable>
        </View>
      </Animated.View>
    </Modal>
  );
}

const s = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "#f0f0ee",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
  },
  sheet: {
    backgroundColor: "#fff",
    borderRadius: 16,
    width: "100%",
    maxWidth: 400,
    maxHeight: "80%",
    padding: 24,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 10,
  },
  title: { fontSize: 17, fontWeight: "700", color: TEXT, marginBottom: 14 },
  body: { marginBottom: 16 },
  bodyContent: { gap: 12 },
  paragraph: { fontSize: 13, color: "#333", lineHeight: 20 },
  linkRow: { flexDirection: "row", gap: 16, marginTop: 4 },
  link: { fontSize: 12, color: TEXT, fontWeight: "600", textDecorationLine: "underline" },

  agreeRow: { flexDirection: "row", alignItems: "center", gap: 10, paddingVertical: 12, borderTopWidth: 1, borderTopColor: BORDER },
  checkbox: { width: 20, height: 20, borderRadius: 5, borderWidth: 1.5, borderColor: "#ccc", alignItems: "center", justifyContent: "center" },
  checkboxChecked: { borderColor: TEXT, backgroundColor: TEXT },
  agreeText: { fontSize: 13, color: "#333", fontWeight: "500" },

  submitBtn: { backgroundColor: TEXT, borderRadius: 999, paddingVertical: 14, alignItems: "center", marginTop: 8 },
  submitBtnDisabled: { opacity: 0.35 },
  submitBtnText: { fontSize: 14, fontWeight: "700", color: "#fff" },
});
