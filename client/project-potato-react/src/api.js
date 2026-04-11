const base = import.meta.env.VITE_API_BASE ?? "";

function wrapNetworkError(err) {
  if (err instanceof TypeError || err?.name === "TypeError") {
    return new Error(
      "API에 연결하지 못했습니다. server에서 npm run dev(기본 포트 5050)를 켠 뒤, client는 npm run dev로 실행했는지 확인하세요."
    );
  }
  return err;
}

/**
 * @param {string} date YYYY-MM-DD (로컬 기준 날짜 권장)
 */
export async function fetchWordByDate(date) {
  const q = new URLSearchParams({ date });
  let res;
  try {
    res = await fetch(`${base}/api/contents/daily?${q}`);
  } catch (e) {
    throw wrapNetworkError(e);
  }
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const err = new Error(data.error || `요청 실패 (${res.status})`);
    err.status = res.status;
    throw err;
  }
  return data;
}

/**
 * @param {string} wordId Content _id
 */
export async function fetchPostsByWordId(wordId) {
  const q = new URLSearchParams({ wordId });
  let res;
  try {
    res = await fetch(`${base}/api/posts?${q}`);
  } catch (e) {
    throw wrapNetworkError(e);
  }
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const err = new Error(data.error || `요청 실패 (${res.status})`);
    err.status = res.status;
    throw err;
  }
  return data;
}

/**
 * @param {string} wordId Content _id
 * @param {string} content
 */
export async function createPost(wordId, content) {
  let res;
  try {
    res = await fetch(`${base}/api/posts`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ wordId, content }),
    });
  } catch (e) {
    throw wrapNetworkError(e);
  }
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const err = new Error(data.error || `요청 실패 (${res.status})`);
    err.status = res.status;
    err.details = data.details;
    throw err;
  }
  return data;
}
