const BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL ?? '';

export interface Example {
  en: string;
  ko: string;
}

export interface Word {
  id: string;
  word: string;
  meaning_ko: string;
  examples: Example[];
}

export interface Post {
  id: string;
  content: string;
  created_at: string;
}

export async function fetchWordByDate(date: string): Promise<Word | null> {
  const res = await fetch(`${BASE_URL}/api/contents/daily?date=${date}`);
  if (res.status === 404) return null;
  if (!res.ok) throw new Error('Failed to fetch word');
  const data = await res.json();
  return data.word ?? null;
}

export async function fetchPostsByWordId(wordId: string): Promise<Post[]> {
  const res = await fetch(`${BASE_URL}/api/posts?wordId=${wordId}`);
  if (!res.ok) throw new Error('Failed to fetch comments');
  const data = await res.json();
  return data.posts ?? [];
}

export async function createPost(wordId: string, content: string): Promise<void> {
  const res = await fetch(`${BASE_URL}/api/posts`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ wordId, content }),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error ?? 'Failed to submit comment');
  }
}
