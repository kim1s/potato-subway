import { useEffect, useRef } from "react";
import { Animated, Modal, Pressable, StyleSheet, Text } from "react-native";

const TEXT = "#111";
const MUTED = "#aaa";

interface Props {
  visible: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export function BlockConfirmModal({ visible, onClose, onConfirm }: Props) {
  const scaleAnim = useRef(new Animated.Value(0.95)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true, tension: 300, friction: 20 }),
        Animated.timing(opacityAnim, { toValue: 1, duration: 150, useNativeDriver: true }),
      ]).start();
    }
  }, [visible]);

  if (!visible) return null;

  return (
    <Modal transparent animationType="none" onRequestClose={onClose}>
      <Pressable style={s.backdrop} onPress={onClose}>
        <Animated.View style={[s.sheet, { transform: [{ scale: scaleAnim }], opacity: opacityAnim }]}>
          <Pressable onPress={() => {}}>
            <Text style={s.title}>이 사용자를 차단할까요?</Text>
            <Text style={s.subtitle}>차단하면 이 사용자가 쓴 글이 더 이상 보이지 않아요.</Text>

            <Pressable style={s.actions}>
              <Pressable onPress={onClose} style={s.actionBtn}>
                <Text style={s.actionBtnText}>취소</Text>
              </Pressable>
              <Pressable onPress={onConfirm} style={s.submitBtn}>
                <Text style={s.submitBtnText}>차단</Text>
              </Pressable>
            </Pressable>
          </Pressable>
        </Animated.View>
      </Pressable>
    </Modal>
  );
}

const s = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.35)",
    alignItems: "center",
    justifyContent: "center",
  },
  sheet: {
    backgroundColor: "#fff",
    borderRadius: 16,
    width: 300,
    overflow: "hidden",
    padding: 20,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 10,
  },
  title: { fontSize: 15, fontWeight: "700", color: TEXT, marginBottom: 4 },
  subtitle: { fontSize: 12, color: MUTED, marginBottom: 16, lineHeight: 18 },

  actions: { flexDirection: "row", justifyContent: "flex-end", gap: 8 },
  actionBtn: { paddingHorizontal: 16, paddingVertical: 10 },
  actionBtnText: { fontSize: 13, fontWeight: "600", color: MUTED },
  submitBtn: { backgroundColor: "#c00", borderRadius: 999, paddingHorizontal: 20, paddingVertical: 10 },
  submitBtnText: { fontSize: 13, fontWeight: "600", color: "#fff" },
});
