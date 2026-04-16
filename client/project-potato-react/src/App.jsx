import { useCallback, useEffect, useMemo, useState } from "react";
import { createPost, fetchPostsByWordId, fetchWordByDate } from "./api.js";
import PotatoHero from "./PotatoHero.jsx";

function localDateKey(d = new Date()) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function formatHeaderDate(isoDate) {
  const [y, m, d] = isoDate.split("-").map(Number);
  if (!y || !m || !d) return isoDate;
  const dt = new Date(y, m - 1, d);
  const w = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][dt.getDay()];
  return `${isoDate} (${w})`;
}

/** 첫 글자만 대문자, 나머지는 원문 그대로 유지 */
function displayWord(w) {
  if (!w || typeof w !== "string") return "";
  return w.charAt(0).toUpperCase() + w.slice(1);
}

/** 한글 포함 여부 검사 — 한글이 있으면 true */
function hasKorean(s) {
  return /[\uAC00-\uD7A3\u1100-\u11FF\u3130-\u318F\uA960-\uA97F\uD7B0-\uD7FF]/.test(s);
}

function formatCommentTime(iso) {
  return new Date(iso).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

export default function App() {
  const [date, setDate] = useState(() => localDateKey());
  const [word, setWord] = useState(null);
  const [loading, setLoading] = useState(true);
  const [noContent, setNoContent] = useState(false);
  const [error, setError] = useState(null);

  const [exampleIndex, setExampleIndex] = useState(0);

  const [posts, setPosts] = useState([]);
  const [postsLoading, setPostsLoading] = useState(false);
  const [postsError, setPostsError] = useState(null);
  const [commentText, setCommentText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState(null);

  /** 히어로 이미지: noContent 상태에 따라 weekday 또는 weekend 이미지 표시 */
  const heroSrc = noContent ? "/heroes/hero_weekend.png" : "/heroes/hero_weekday.png";

  const load = useCallback(async (publishDate) => {
    setLoading(true);
    setError(null);
    setNoContent(false);
    setWord(null);
    try {
      const data = await fetchWordByDate(publishDate);
      setWord(data);
    } catch (e) {
      if (e.status === 404) {
        setNoContent(true);
      } else {
        setError(e.message || "Something went wrong.");
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load(date);
  }, [date, load]);

  useEffect(() => {
    setExampleIndex(0);
  }, [word?._id]);

  useEffect(() => {
    setFormError(null);
    setCommentText("");
  }, [word?._id]);

  useEffect(() => {
    const id = word?._id;
    if (!id) {
      setPosts([]);
      setPostsError(null);
      return;
    }
    let cancelled = false;
    (async () => {
      setPostsLoading(true);
      setPostsError(null);
      try {
        const { posts: list } = await fetchPostsByWordId(id);
        if (!cancelled) setPosts(list ?? []);
      } catch (e) {
        if (!cancelled) setPostsError(e.message || "Could not load comments.");
      } finally {
        if (!cancelled) setPostsLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [word?._id]);

  const examples = word?.examples ?? [];
  const currentExample = examples[exampleIndex] ?? null;
  const canRefreshExample = examples.length > 1;

  const sortedPosts = useMemo(() => {
    return [...posts].sort(
      (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
    );
  }, [posts]);

  function handleRefreshExample() {
    if (examples.length <= 1) return;
    setExampleIndex((i) => (i + 1) % examples.length);
  }

  async function handleCommentSubmit(e) {
    e.preventDefault();
    const id = word?._id;
    const text = commentText.trim();
    if (!id || !text || submitting) return;
    if (hasKorean(text)) {
      setFormError("한글은 입력할 수 없어요. Please write in English.");
      return;
    }
    setFormError(null);
    setSubmitting(true);
    try {
      await createPost(id, text);
      setCommentText("");
      const { posts: list } = await fetchPostsByWordId(id);
      setPosts(list ?? []);
    } catch (err) {
      setFormError(err.message || "Could not post.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="shell">
      <div className="app">
        <header className="hero">
          <h1 className="brand">Potato on the Subway</h1>
          <label className="header-date">
            <span className="header-date__text">{formatHeaderDate(date)}</span>
            <input
              type="date"
              className="header-date__input"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              aria-label="Choose date"
            />
          </label>

          {/* 히어로 이미지: weekday/weekend 상태에 따라 표시 */}
          <div className="hero-art">
            <img src={heroSrc} className="hero-art__img" alt="" decoding="async" />
          </div>
        </header>

        <main className="main">
          {loading && <p className="state-msg">Loading…</p>}

          {/* 서버/네트워크 에러 */}
          {!loading && error && (
            <div className="panel panel--notice" role="status">
              <p className="state-msg state-msg--error">{error}</p>
            </div>
          )}

          {/* 해당 날짜에 단어 없음 (404) — 준비 중 이미지 자리 */}
          {!loading && noContent && (
            <div className="no-content" role="status">
              <div className="no-content__art">
                {/* TODO: 어드민에서 "준비 중" 이미지 등록 후 <img> 로 교체 */}
                <PotatoHero />
              </div>
              <p className="no-content__msg">오늘의 단어를 준비 중이에요.</p>
              <p className="no-content__sub">Come back tomorrow!</p>
            </div>
          )}

          {/* 단어 정상 로드 */}
          {!loading && !error && !noContent && word && (
            <>
              <section className="block" aria-labelledby="today-word-label">
                <p id="today-word-label" className="eyebrow">
                  Today&apos;s word
                </p>
                <div className="panel panel--word">
                  <p className="word-title">{displayWord(word.word)}</p>
                  <p className="word-meaning">{word.meaning?.ko}</p>
                </div>
              </section>

              <section className="block" aria-labelledby="examples-label">
                <div className="row-title">
                  <p id="examples-label" className="eyebrow eyebrow--inline">
                    Examples
                  </p>
                  <button
                    type="button"
                    className="btn-refresh"
                    onClick={handleRefreshExample}
                    disabled={!canRefreshExample}
                  >
                    Refresh
                  </button>
                </div>
                <div className="panel panel--example">
                  {currentExample ? (
                    <>
                      <p className="example-en">{currentExample.en}</p>
                      <p className="example-ko">{currentExample.ko}</p>
                    </>
                  ) : (
                    <p className="hint">No examples for this word.</p>
                  )}
                </div>
              </section>

              <section className="block" aria-labelledby="talk-label">
                <p id="talk-label" className="eyebrow">
                  Potatos talk to each others
                </p>
                <form className="talk-form" onSubmit={handleCommentSubmit}>
                  <div className="talk-row">
                    <input
                      type="text"
                      className="talk-input"
                      maxLength={2000}
                      placeholder="Write anything with today's word. (English only)"
                      value={commentText}
                      onChange={(e) => setCommentText(e.target.value)}
                      disabled={submitting}
                      autoComplete="off"
                      aria-label="Comment in English"
                    />
                    <button
                      type="submit"
                      className="btn-drop"
                      disabled={submitting || !commentText.trim()}
                    >
                      {submitting ? "…" : "Drop It"}
                    </button>
                  </div>
                  {formError && (
                    <p className="state-msg state-msg--error form-error">
                      {formError}
                    </p>
                  )}
                </form>

                <div className="panel panel--comments">
                  {postsLoading && (
                    <p className="hint">Loading comments…</p>
                  )}
                  {postsError && !postsLoading && (
                    <p className="state-msg state-msg--error">{postsError}</p>
                  )}
                  {!postsLoading && !postsError && sortedPosts.length === 0 && (
                    <p className="hint">No potatoes yet. Drop the first line.</p>
                  )}
                  {!postsLoading && !postsError && sortedPosts.length > 0 && (
                    <ul className="comment-rows">
                      {sortedPosts.map((p) => (
                        <li key={p._id} className="comment-row">
                          <span className="comment-row__text">{p.content}</span>
                          <time
                            className="comment-row__time"
                            dateTime={p.createdAt}
                          >
                            {formatCommentTime(p.createdAt)}
                          </time>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </section>
            </>
          )}
        </main>
      </div>
    </div>
  );
}
