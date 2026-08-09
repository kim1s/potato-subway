const BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL ?? "";

export interface Example {
  en: string;
  ko: string;
}

export interface Word {
  id: string;
  word: string;
  meaning_ko: string | null;
  meaning_en: string | null;
  examples: Example[];
  publish_date: string;
}

export interface Post {
  id: string;
  word_id: string;
  content: string;
  created_at: string;
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, init);
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    const err = Object.assign(new Error((body as { error?: string }).error ?? "Request failed"), { status: res.status });
    throw err;
  }
  return res.json();
}

export function fetchWordByDate(date: string): Promise<Word> {
  return request(`/api/contents/daily?date=${date}`);
}

export async function fetchPostsByWordId(wordId: string, viewerId?: string | null): Promise<Post[]> {
  const query = viewerId ? `&viewerId=${encodeURIComponent(viewerId)}` : "";
  const data = await request<{ posts: Post[] }>(`/api/posts?wordId=${wordId}${query}`);
  return data.posts ?? [];
}

export async function fetchAvailableDatesForMonth(monthKey: string): Promise<string[]> {
  try {
    const data = await request<{ publish_date: string }[]>(`/api/contents/month/${monthKey}`);
    return (Array.isArray(data) ? data : []).map((c) => c.publish_date.slice(0, 10));
  } catch {
    return [];
  }
}

export function createPost(wordId: string, content: string, userId: string): Promise<Post> {
  return request("/api/posts", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ wordId, content, userId }),
  });
}

export async function fetchUserStatus(userId: string): Promise<{ banned: boolean }> {
  try {
    return await request(`/api/users/${userId}/status`);
  } catch {
    return { banned: false };
  }
}

export type ReportReason = "spam" | "abuse" | "sexual" | "other";

export async function reportPost(postId: string, reason: ReportReason): Promise<void> {
  await request(`/api/posts/${postId}/report`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ reason }),
  });
}

export async function blockPostAuthor(postId: string, blockerId: string): Promise<void> {
  await request(`/api/posts/${postId}/block`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ blockerId }),
  });
}
