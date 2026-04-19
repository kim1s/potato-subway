"use client";

import { useEffect, useState } from "react";

interface ImportResult {
  message?: string;
  upserted?: number;
  error?: string;
}

export default function AdminPage() {
  const [notionUrl, setNotionUrl] = useState("");
  const [status, setStatus] = useState<null | "loading" | "done" | "error">(null);
  const [result, setResult] = useState<ImportResult | null>(null);

  useEffect(() => {
    fetch("/api/admin")
      .then((r) => r.json())
      .then((data) => { if (data.notionDatabaseUrl) setNotionUrl(data.notionDatabaseUrl); })
      .catch(() => {});
  }, []);

  async function handleImport(e: React.FormEvent) {
    e.preventDefault();
    const url = notionUrl.trim();
    if (!url) return;
    setStatus("loading");
    setResult(null);
    try {
      const res = await fetch("/api/admin/import-notion", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notionUrl: url }),
      });
      const data = await res.json();
      if (!res.ok) { setStatus("error"); setResult({ error: data.error ?? `오류 (${res.status})` }); }
      else { setStatus("done"); setResult(data); }
    } catch {
      setStatus("error");
      setResult({ error: "서버에 연결할 수 없어요." });
    }
  }

  return (
    <div className="min-h-dvh px-5 py-10">
      <div className="mx-auto w-full max-w-lg">

        <header className="flex items-center gap-3 mb-10">
          <h1 className="text-sm font-semibold uppercase tracking-wider text-stone-900">
            Potato on the Subway
          </h1>
          <span className="text-[0.5625rem] font-semibold uppercase tracking-widest text-stone-400 border border-stone-300 px-2 py-0.5">
            Admin
          </span>
        </header>

        <section className="bg-white border border-stone-200 p-6 mb-4">
          <h2 className="text-[0.5625rem] font-semibold uppercase tracking-widest text-stone-400 mb-6">
            Notion에서 콘텐츠 가져오기
          </h2>

          <div className="bg-stone-50 border border-stone-200 px-4 py-4 mb-6 text-xs text-stone-600 leading-relaxed">
            <p className="text-[0.5625rem] font-semibold uppercase tracking-widest text-stone-400 mb-2">
              사전 준비사항
            </p>
            <ol className="list-decimal list-inside space-y-2">
              <li>
                Notion에서 Integration을 생성하고{" "}
                <code className="font-mono bg-stone-200 px-1 text-stone-700">NOTION_TOKEN</code>을 환경변수에 등록
              </li>
              <li>가져올 Notion Database를 해당 Integration과 공유</li>
              <li>
                Database 컬럼명:
                <code className="block mt-1.5 font-mono bg-stone-200 text-stone-700 px-2 py-1.5 text-[0.625rem] break-all">
                  date · word · word_ko · example_1 · example_1_ko · example_2 · example_2_ko · example_3 · example_3_ko
                </code>
              </li>
            </ol>
          </div>

          <form onSubmit={handleImport} className="space-y-6">
            <div className="flex flex-col gap-2">
              <label htmlFor="notion-url" className="text-[0.5625rem] font-semibold uppercase tracking-widest text-stone-400">
                Notion Database URL
              </label>
              <input
                id="notion-url"
                type="url"
                placeholder="https://notion.so/..."
                value={notionUrl}
                onChange={(e) => setNotionUrl(e.target.value)}
                autoFocus
                className="bg-transparent border-b border-stone-300 py-2 text-sm text-stone-800 outline-none placeholder:text-stone-400 focus:border-stone-800 transition-colors"
              />
            </div>

            <button
              type="submit"
              disabled={status === "loading" || !notionUrl.trim()}
              className="text-[0.5625rem] font-semibold uppercase tracking-widest text-white bg-stone-900 px-5 py-2.5 hover:bg-stone-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              {status === "loading" ? "가져오는 중…" : "Import"}
            </button>
          </form>
        </section>

        {status === "loading" && (
          <div className="border border-stone-200 bg-stone-50 px-4 py-3">
            <p className="text-xs text-stone-500">Notion에서 데이터를 읽고 있어요…</p>
          </div>
        )}

        {status === "error" && result && (
          <div className="border border-red-200 bg-red-50 px-4 py-3">
            <p className="text-[0.5625rem] font-semibold uppercase tracking-widest text-red-400 mb-1.5">오류</p>
            <p className="text-sm text-red-700">{result.error}</p>
          </div>
        )}

        {status === "done" && result && (
          <div className="border border-stone-200 bg-white px-4 py-4">
            <p className="text-[0.5625rem] font-semibold uppercase tracking-widest text-stone-400 mb-3">완료</p>
            <ul className="text-sm text-stone-700 space-y-1.5">
              <li>처리됨: <strong className="font-semibold text-stone-900">{result.upserted}건</strong></li>
            </ul>
            {result.message && <p className="mt-3 text-xs text-stone-400">{result.message}</p>}
          </div>
        )}

      </div>
    </div>
  );
}
