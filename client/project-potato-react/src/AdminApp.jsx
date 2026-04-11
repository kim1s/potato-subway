import { useEffect, useState } from "react";

export default function AdminApp() {
  const [notionUrl, setNotionUrl] = useState("");
  const [status, setStatus] = useState(null); // null | "loading" | "done" | "error"
  const [result, setResult] = useState(null);

  useEffect(() => {
    fetch("/api/admin/config")
      .then((r) => r.json())
      .then((data) => {
        if (data.notionDatabaseUrl) {
          setNotionUrl(data.notionDatabaseUrl);
        }
      })
      .catch(() => {});
  }, []);

  async function handleImport(e) {
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
      if (!res.ok) {
        setStatus("error");
        setResult({ error: data.error ?? `오류 (${res.status})` });
      } else {
        setStatus("done");
        setResult(data);
      }
    } catch (err) {
      setStatus("error");
      setResult({ error: "서버에 연결할 수 없어요. 서버가 실행 중인지 확인해주세요." });
    }
  }

  return (
    <div className="admin-shell">
      <div className="admin-wrap">
        <header className="admin-header">
          <h1 className="admin-brand">Potato on the Subway</h1>
          <span className="admin-badge">Admin</span>
        </header>

        <section className="admin-section">
          <h2 className="admin-section-title">Notion에서 콘텐츠 가져오기</h2>

          <div className="admin-guide">
            <p className="admin-guide-title">사전 준비사항</p>
            <ol className="admin-guide-list">
              <li>Notion에서 Integration을 생성하고 <code>NOTION_TOKEN</code>을 서버 환경변수에 등록</li>
              <li>가져올 Notion Database를 해당 Integration과 공유</li>
              <li>Database 컬럼명은 아래와 같이 설정:
                <code className="admin-code-block">
                  date · word · word_ko · example_1 · example_1_ko · example_2 · example_2_ko · example_3 · example_3_ko
                </code>
              </li>
            </ol>
          </div>

          <form className="admin-form" onSubmit={handleImport}>
            <div className="admin-field">
              <label className="admin-label" htmlFor="notion-url">Notion Database URL</label>
              <input
                id="notion-url"
                type="url"
                className="admin-input"
                placeholder="https://notion.so/..."
                value={notionUrl}
                onChange={(e) => setNotionUrl(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") handleImport(e); }}
                autoFocus
              />
            </div>

            <button
              type="submit"
              className="admin-btn"
              disabled={status === "loading" || !notionUrl.trim()}
            >
              {status === "loading" ? "가져오는 중…" : "Import"}
            </button>
          </form>
        </section>

        {status === "loading" && (
          <div className="admin-result admin-result--loading">
            Notion에서 데이터를 읽고 있어요…
          </div>
        )}

        {status === "error" && result && (
          <div className="admin-result admin-result--error">
            <p className="admin-result-title">오류</p>
            <p>{result.error}</p>
          </div>
        )}

        {status === "done" && result && (
          <div className="admin-result admin-result--success">
            <p className="admin-result-title">완료</p>
            <ul className="admin-result-list">
              <li>신규 등록: <strong>{result.imported}건</strong></li>
              <li>업데이트: <strong>{result.updated}건</strong></li>
              {result.failed?.length > 0 && (
                <li className="admin-result-failed">
                  실패: {result.failed.length}건
                  <ul>
                    {result.failed.map((f, i) => (
                      <li key={i}>{f.publishDate} — {f.error}</li>
                    ))}
                  </ul>
                </li>
              )}
            </ul>
            {result.message && <p className="admin-result-msg">{result.message}</p>}
          </div>
        )}
      </div>
    </div>
  );
}
