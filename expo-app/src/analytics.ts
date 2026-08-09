import analytics from "@react-native-firebase/analytics";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { init as initAmplitude, track as trackAmplitude } from "@amplitude/analytics-react-native";

const VISITED_KEY = "analytics_visited";

const amplitudeApiKey = process.env.EXPO_PUBLIC_AMPLITUDE_API_KEY;
if (amplitudeApiKey) {
  initAmplitude(amplitudeApiKey);
}

function logEvent(name: string, params?: Record<string, unknown>) {
  try {
    analytics().logEvent(name, params);
  } catch { /* analytics must never break the app */ }
  try {
    trackAmplitude(name, params);
  } catch { /* analytics must never break the app */ }
}

/** 방문 / 재방문 */
export async function logVisit() {
  const visited = await AsyncStorage.getItem(VISITED_KEY);
  if (visited) {
    logEvent("app_revisit");
  } else {
    await AsyncStorage.setItem(VISITED_KEY, "true");
    logEvent("app_visit");
  }
}

/** 댓글창 탭 (글자 입력 시작) */
export async function logCommentFocus() {
  logEvent("comment_focus");
}

/** 댓글 게시 (Drop It 버튼) */
export async function logCommentSubmit(word: string) {
  logEvent("comment_submit", { word });
}

/** 예문 스와이프 */
export async function logExampleSwipe(direction: "left" | "right", toIndex: number) {
  logEvent("example_swipe", { direction, to_index: toIndex });
}

/** 달력에서 날짜 이동 */
export async function logCalendarDateSelect(date: string) {
  logEvent("calendar_date_select", { date });
}

/** 댓글 신고 */
export async function logCommentReport(word: string) {
  logEvent("comment_report", { word });
}

/** 사용자 차단 */
export async function logUserBlock(word: string) {
  logEvent("user_block", { word });
}
