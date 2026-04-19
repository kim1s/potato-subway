import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createPost, fetchPostsByWordId, fetchWordByDate } from "./api.js";
import "./App.css";

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

function displayWord(w) {
  if (!w || typeof w !== "string") return "";
  return w.charAt(0).toUpperCase() + w.slice(1);
}

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
  const [swipeDir, setSwipeDir] = useState(null);
  const [animKey, setAnimKey] = useState(0);
  const touchStartX = useRef(null);
  const [posts, setPosts] = useState([]);
  const [postsLoading, setPostsLoading] = useState(false);
  const [postsError, setPostsError] = useState(null);
  const [commentText, setCommentText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [formError, setFormError] = useState(null);

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

  useEffect(() => { load(date); }, [date, load]);
  useEffect(() => { setExampleIndex(0); }, [word?._id]);
  useEffect(() => { setFormError(null); setCommentText(""); }, [word?._id]);

  useEffect(() => {
    const id = word?._id;
    if (!id) { setPosts([]); setPostsError(null); return; }
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
    return () => { cancelled = true; };
  }, [word?._id]);

  const examples = word?.examples ?? [];
  const currentExample = examples[exampleIndex] ?? null;
  const canRefreshExample = examples.length > 1;

  function goToExample(nextIndex, dir) {
    setSwipeDir(dir);
    setAnimKey((k) => k + 1);
    setExampleIndex(nextIndex);
  }

  function handleTouchStart(e) {
    touchStartX.current = e.touches[0].clientX;
  }

  function handleTouchEnd(e) {
    if (touchStartX.current === null || examples.length <= 1) return;
    const delta = e.changedTouches[0].clientX - touchStartX.current;
    touchStartX.current = null;
    if (Math.abs(delta) < 40) return;
    if (delta < 0) {
      goToExample(Math.min(exampleIndex + 1, examples.length - 1), "left");
    } else {
      goToExample(Math.max(exampleIndex - 1, 0), "right");
    }
  }

  const sortedPosts = useMemo(() =>
    [...posts].sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt)),
    [posts]
  );

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
      setSubmitted(true);
      setTimeout(() => setSubmitted(false), 2000);
      const { posts: list } = await fetchPostsByWordId(id);
      setPosts(list ?? []);
    } catch (err) {
      setFormError(err.message || "Could not post.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="app">
      <div className="app-inner">

        <header className="app-header">
          <h1 className="app-title">Potato on the Subway</h1>
          <label className="app-date-label">
            <span>{formatHeaderDate(date)}</span>
            <input
              type="date"
              className="app-date-input"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              aria-label="Choose date"
            />
          </label>
          {!noContent && !loading && !error && (
            <div className="app-hero">
              <img src="/heroes/hero_weekday.png" alt="" decoding="async" />
            </div>
          )}
        </header>

        {loading && (
          <p className="loading-text">Loading…</p>
        )}

        {!loading && error && (
          <div className="error-box">
            <p>{error}</p>
          </div>
        )}

        {!loading && noContent && (
          <div className="weekend-content">
            <p className="weekend-message">{"Why are you here?\nIt's the weekend. Go rest."}</p>
            <div className="weekend-hero">
              <img src="/heroes/hero_weekend.png" alt="" decoding="async" />
            </div>
          </div>
        )}

        {!loading && !error && !noContent && word && (
          <main className="main-content">

            <section className="section">
              <div className="section-label-row">
                <p className="section-label">Today&apos;s word</p>
              </div>
              <div className="card">
                <h2 className="word-text">{displayWord(word.word)}</h2>
                <p className="word-meaning">{word.meaning?.ko}</p>
              </div>
            </section>

            <section className="section">
              <div className="section-label-row">
                <p className="section-label">How it&apos;s used</p>
                {canRefreshExample && (
                  <div className="dots">
                    {examples.map((_, i) => (
                      <button
                        key={i}
                        type="button"
                        className={`dot${i === exampleIndex ? " dot--active" : ""}`}
                        onClick={() => goToExample(i, i > exampleIndex ? "left" : "right")}
                        aria-label={`Example ${i + 1}`}
                      />
                    ))}
                  </div>
                )}
              </div>
              <div
                className="card card--examples"
                onTouchStart={handleTouchStart}
                onTouchEnd={handleTouchEnd}
              >
                <div key={animKey} className={swipeDir === "left" ? "slide-in-right" : "slide-in-left"}>
                  {currentExample ? (
                    <>
                      <p className="example-en">{currentExample.en}</p>
                      <p className="example-ko">{currentExample.ko}</p>
                    </>
                  ) : (
                    <p className="empty-text">No examples for this word.</p>
                  )}
                </div>
              </div>
            </section>

            <section className="section">
              <div className="section-label-row">
                <p className="section-label">Leave a note</p>
              </div>
              <form className="note-form" onSubmit={handleCommentSubmit}>
                <div className="note-input-row">
                  <input
                    type="text"
                    className="note-input"
                    maxLength={80}
                    placeholder="Try today's word"
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    disabled={submitting}
                    autoComplete="off"
                    aria-label="Comment in English"
                  />
                  <button
                    type="submit"
                    className={`note-submit${submitted ? " note-submit--dropped" : ""}`}
                    disabled={submitting || !commentText.trim()}
                  >
                    {submitted ? "Dropped ✓" : "Drop It"}
                  </button>
                </div>
                {commentText.length > 0 && (
                  <p className="note-char-count">{commentText.length}/80</p>
                )}
                {formError && <p className="form-error">{formError}</p>}
              </form>

              <div className="comments">
                {postsLoading && (
                  <p className="comment-empty">Loading comments…</p>
                )}
                {postsError && !postsLoading && (
                  <p className="comment-error">{postsError}</p>
                )}
                {!postsLoading && !postsError && sortedPosts.length === 0 && (
                  <p className="comment-empty">Be the first to drop a note.</p>
                )}
                {!postsLoading && !postsError && sortedPosts.length > 0 && (
                  <ul className="comment-list">
                    {sortedPosts.map((p) => (
                      <li key={p._id} className="comment-item">
                        <span className="comment-text">{p.content}</span>
                        <time className="comment-time" dateTime={p.createdAt}>
                          {formatCommentTime(p.createdAt)}
                        </time>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </section>

          </main>
        )}

        <footer className="app-footer">
          <p>Potato on the Subway · Every weekday morning</p>
        </footer>

      </div>
    </div>
  );
}
