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
  const [posts, setPosts] = useState([]);
  const [postsLoading, setPostsLoading] = useState(false);
  const [postsError, setPostsError] = useState(null);
  const [commentText, setCommentText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState(null);

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

  const sortedPosts = useMemo(() =>
    [...posts].sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt)),
    [posts]
  );

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
    <div className="min-h-dvh px-5 py-10" style={{ paddingTop: "calc(2.5rem + env(safe-area-inset-top, 0))", paddingBottom: "calc(3rem + env(safe-area-inset-bottom, 0))" }}>
      <div className="mx-auto w-full max-w-[22rem]">

        {/* Header */}
        <header className="text-center mb-10">
          <p className="text-[0.5625rem] font-semibold uppercase tracking-[0.22em] text-stone-400 mb-3">
            Potato on the Subway
          </p>

          <label className="relative inline-block cursor-pointer group">
            <span className="text-xs text-stone-500 border-b border-stone-300 pb-0.5 group-hover:border-stone-600 transition-colors">
              {formatHeaderDate(date)}
            </span>
            <input
              type="date"
              className="absolute inset-0 opacity-0 cursor-pointer w-full h-full text-base"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              aria-label="Choose date"
            />
          </label>

          <div className="mt-6 flex justify-center items-center">
            <img src={heroSrc} alt="" decoding="async" className="w-auto h-auto" />
          </div>
        </header>

        {/* States */}
        {loading && (
          <p className="text-center text-[0.5625rem] font-semibold uppercase tracking-widest text-stone-400 py-10">
            Loading…
          </p>
        )}

        {!loading && error && (
          <div className="border border-stone-200 bg-white px-4 py-3">
            <p className="text-xs text-red-700">{error}</p>
          </div>
        )}

        {!loading && noContent && (
          <div className="flex flex-col items-center py-10 text-center">
            <div className="opacity-40 mb-5">
              <PotatoHero />
            </div>
            <p className="text-sm font-semibold text-stone-700 mb-1.5">오늘의 단어를 준비 중이에요.</p>
            <p className="text-[0.5625rem] font-semibold uppercase tracking-widest text-stone-400">
              Come back tomorrow!
            </p>
          </div>
        )}

        {!loading && !error && !noContent && word && (
          <main className="space-y-6">

            {/* Word */}
            <section aria-labelledby="today-word-label">
              <p id="today-word-label" className="text-[0.5625rem] font-semibold uppercase tracking-widest text-stone-400 mb-2">
                Today&apos;s word
              </p>
              <div className="bg-white border border-stone-200 px-4 py-4">
                <h2 className="text-2xl font-bold uppercase tracking-tight text-stone-900 mb-1.5">
                  {displayWord(word.word)}
                </h2>
                <p className="text-sm text-stone-500">{word.meaning?.ko}</p>
              </div>
            </section>

            {/* Examples */}
            <section aria-labelledby="examples-label">
              <div className="flex items-center justify-between mb-2">
                <p id="examples-label" className="text-[0.5625rem] font-semibold uppercase tracking-widest text-stone-400">
                  Examples
                </p>
                <button
                  type="button"
                  onClick={handleRefreshExample}
                  disabled={!canRefreshExample}
                  className="text-[0.5625rem] font-semibold uppercase tracking-widest text-stone-400 hover:text-stone-800 hover:underline underline-offset-2 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                  Refresh
                </button>
              </div>
              <div className="bg-white border border-stone-200 px-4 py-4 min-h-[5rem]">
                {currentExample ? (
                  <>
                    <p className="text-sm font-semibold text-stone-900 mb-1.5 leading-snug">
                      {currentExample.en}
                    </p>
                    <p className="text-sm text-stone-500 leading-snug">{currentExample.ko}</p>
                  </>
                ) : (
                  <p className="text-xs text-stone-400 italic">No examples for this word.</p>
                )}
              </div>
            </section>

            {/* Talk */}
            <section aria-labelledby="talk-label">
              <p id="talk-label" className="text-[0.5625rem] font-semibold uppercase tracking-widest text-stone-400 mb-3">
                Potatos Talk
              </p>

              <form onSubmit={handleCommentSubmit} className="mb-3">
                <div className="flex items-center gap-3 border-b border-stone-300 pb-2 focus-within:border-stone-700 transition-colors">
                  <input
                    type="text"
                    maxLength={2000}
                    placeholder="Write with today's word..."
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    disabled={submitting}
                    autoComplete="off"
                    aria-label="Comment in English"
                    className="flex-1 min-w-0 bg-transparent text-sm outline-none placeholder:text-stone-400 placeholder:italic text-stone-800 disabled:opacity-60"
                  />
                  <button
                    type="submit"
                    disabled={submitting || !commentText.trim()}
                    className="flex-shrink-0 text-[0.5625rem] font-semibold uppercase tracking-widest text-stone-800 hover:underline underline-offset-2 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  >
                    {submitting ? "…" : "Drop It"}
                  </button>
                </div>
                {formError && (
                  <p className="mt-2 text-xs text-red-600">{formError}</p>
                )}
              </form>

              <div className="bg-white border border-stone-200">
                {postsLoading && (
                  <p className="text-xs text-stone-400 italic px-4 py-3">Loading comments…</p>
                )}
                {postsError && !postsLoading && (
                  <p className="text-xs text-red-600 px-4 py-3">{postsError}</p>
                )}
                {!postsLoading && !postsError && sortedPosts.length === 0 && (
                  <p className="text-xs text-stone-400 italic px-4 py-3">
                    No potatoes yet. Drop the first line.
                  </p>
                )}
                {!postsLoading && !postsError && sortedPosts.length > 0 && (
                  <ul className="divide-y divide-stone-100">
                    {sortedPosts.map((p) => (
                      <li key={p._id} className="flex items-start justify-between gap-4 px-4 py-3">
                        <span className="flex-1 min-w-0 text-sm text-stone-800 break-words leading-snug">
                          {p.content}
                        </span>
                        <time
                          className="flex-shrink-0 text-xs text-stone-400 whitespace-nowrap pt-0.5"
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

          </main>
        )}

      </div>
    </div>
  );
}
