import { useEffect, useRef, useState } from "react";
import {
  Animated,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import type { ReportReason } from "../api/client";

const BORDER = "#e8e8e6";
const TEXT = "#111";
const MUTED = "#aaa";

const REASONS: { value: ReportReason; label: string }[] = [
  { value: "spam", label: "스팸" },
  { value: "abuse", label: "욕설" },
  { value: "sexual", label: "음란물" },
  { value: "other", label: "기타" },
];

interface Props {
  visible: boolean;
  onClose: () => void;
  onSubmit: (reason: ReportReason) => void;
}

export function ReportModal({ visible, onClose, onSubmit }: Props) {
  const [reason, setReason] = useState<ReportReason | null>(null);

  const scaleAnim = useRef(new Animated.Value(0.95)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      setReason(null);
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
            <Text style={s.title}>해당 노트를 신고할까요?</Text>
            <Text style={s.subtitle}>신고 사유를 선택해주세요</Text>

            <View style={s.reasonList}>
              {REASONS.map((r) => {
                const selected = reason === r.value;
                return (
                  <Pressable
                    key={r.value}
                    style={[s.reasonRow, selected && s.reasonRowSelected]}
                    onPress={() => setReason(r.value)}
                  >
                    <View style={[s.radio, selected && s.radioSelected]} />
                    <Text style={[s.reasonLabel, selected && s.reasonLabelSelected]}>{r.label}</Text>
                  </Pressable>
                );
              })}
            </View>

            <View style={s.actions}>
              <Pressable onPress={onClose} style={s.actionBtn}>
                <Text style={s.actionBtnText}>취소</Text>
              </Pressable>
              <Pressable
                onPress={() => reason && onSubmit(reason)}
                style={[s.submitBtn, !reason && s.submitBtnDisabled]}
                disabled={!reason}
              >
                <Text style={s.submitBtnText}>신고</Text>
              </Pressable>
            </View>
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
  subtitle: { fontSize: 12, color: MUTED, marginBottom: 16 },

  reasonList: { gap: 8, marginBottom: 16 },
  reasonRow: { flexDirection: "row", alignItems: "center", gap: 10, paddingVertical: 10, paddingHorizontal: 12, borderRadius: 8, borderWidth: 1, borderColor: BORDER },
  reasonRowSelected: { borderColor: TEXT, backgroundColor: "#f7f7f6" },
  radio: { width: 16, height: 16, borderRadius: 8, borderWidth: 1.5, borderColor: "#ccc" },
  radioSelected: { borderColor: TEXT, backgroundColor: TEXT },
  reasonLabel: { fontSize: 13, color: "#333" },
  reasonLabelSelected: { color: TEXT, fontWeight: "600" },

  actions: { flexDirection: "row", justifyContent: "flex-end", gap: 8 },
  actionBtn: { paddingHorizontal: 16, paddingVertical: 10 },
  actionBtnText: { fontSize: 13, fontWeight: "600", color: MUTED },
  submitBtn: { backgroundColor: TEXT, borderRadius: 999, paddingHorizontal: 20, paddingVertical: 10 },
  submitBtnDisabled: { opacity: 0.35 },
  submitBtnText: { fontSize: 13, fontWeight: "600", color: "#fff" },
});
