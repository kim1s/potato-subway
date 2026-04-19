const NOTION_API = "https://api.notion.com/v1";
const NOTION_VERSION = "2022-06-28";

export interface NotionRow {
  publishDate: string;
  monthKey: string;
  word: string;
  meaning: { ko: string; en: string };
  examples: { en: string; ko: string }[];
  isActive: boolean;
}

function parseDatabaseId(url: string): string {
  const clean = url.split("?")[0].split("#")[0];
  const last = clean.split("/").pop() ?? "";
  const m =
    last.match(/([a-f0-9]{32})$/i) ||
    last.match(/([a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12})$/i);
  if (!m) throw new Error(`Notion URL에서 Database ID를 찾을 수 없어요.\n입력값: ${url}`);
  return m[1].replace(/-/g, "");
}

async function queryDatabase(databaseId: string, token: string, startCursor?: string) {
  const body = startCursor ? { start_cursor: startCursor } : {};
  const res = await fetch(`${NOTION_API}/databases/${databaseId}/query`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Notion-Version": NOTION_VERSION,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({})) as { message?: string };
    throw new Error(err.message ?? `Notion API 오류 (${res.status})`);
  }
  return res.json();
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function getText(prop: any): string {
  if (!prop) return "";
  switch (prop.type) {
    case "title": return prop.title.map((t: { plain_text: string }) => t.plain_text).join("").trim();
    case "rich_text": return prop.rich_text.map((t: { plain_text: string }) => t.plain_text).join("").trim();
    case "date": return prop.date?.start ?? "";
    case "select": return prop.select?.name ?? "";
    case "number": return String(prop.number ?? "");
    default: return "";
  }
}

function parsePublishDate(raw: string): string {
  if (!raw) throw new Error("date 컬럼 값이 비어 있어요.");
  const cleaned = raw.replace(/\s+/g, "").replace(/\([^)]+\)/g, "");
  const m = cleaned.match(/(\d{4})-0*(\d{1,2})-0*(\d{1,2})/);
  if (!m) throw new Error(`날짜 형식을 파싱할 수 없어요: "${raw}"`);
  const [, y, mo, d] = m;
  return `${y}-${mo.padStart(2, "0")}-${d.padStart(2, "0")}`;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function findProp(props: Record<string, any>, ...keys: string[]) {
  for (const key of keys) {
    if (props[key]) return props[key];
    const lower = key.toLowerCase();
    const found = Object.keys(props).find((k) => k.toLowerCase() === lower);
    if (found) return props[found];
  }
  return null;
}

export async function fetchNotionRows(notionUrl: string, notionToken: string): Promise<NotionRow[]> {
  const databaseId = parseDatabaseId(notionUrl);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const pages: any[] = [];
  let cursor: string | undefined;
  do {
    const res = await queryDatabase(databaseId, notionToken, cursor);
    pages.push(...(res.results ?? []));
    cursor = res.has_more ? res.next_cursor : undefined;
  } while (cursor);

  if (pages.length === 0) return [];

  const items: NotionRow[] = [];
  for (const page of pages) {
    const p = page.properties;
    const dateRaw = getText(findProp(p, "date", "Date", "날짜"));
    const word = getText(findProp(p, "word", "Word", "단어"));
    const wordKo = getText(findProp(p, "word_ko", "Word_ko", "Word_Ko", "뜻", "한국어"));
    if (!dateRaw || !word || !wordKo) continue;

    let publishDate: string;
    try { publishDate = parsePublishDate(dateRaw); } catch { continue; }
    const monthKey = publishDate.slice(0, 7);

    const examples: { en: string; ko: string }[] = [];
    for (let i = 1; i <= 3; i++) {
      const en = getText(findProp(p, `example_${i}`, `Example_${i}`, `example${i}`));
      const ko = getText(findProp(p, `example_${i}_ko`, `Example_${i}_ko`, `example${i}ko`));
      if (en && ko) examples.push({ en, ko });
    }

    items.push({ publishDate, monthKey, word, meaning: { ko: wordKo, en: word }, examples, isActive: true });
  }
  return items;
}
