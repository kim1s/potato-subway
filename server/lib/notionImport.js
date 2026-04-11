const NOTION_API = "https://api.notion.com/v1";
const NOTION_VERSION = "2022-06-28";

/**
 * Notion URL에서 Database ID 추출
 * 예: https://www.notion.so/abc123...?v=... → abc123...
 */
function parseDatabaseId(url) {
  const clean = url.split("?")[0].split("#")[0];
  const last = clean.split("/").pop();
  const m =
    last.match(/([a-f0-9]{32})$/i) ||
    last.match(/([a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12})$/i);
  if (!m) {
    throw new Error(
      `Notion URL에서 Database ID를 찾을 수 없어요.\n입력값: ${url}`
    );
  }
  // 하이픈 없이 반환 (Notion REST API가 양쪽 다 허용)
  return m[1].replace(/-/g, "");
}

/**
 * Notion Database 쿼리 (직접 REST API 호출)
 */
async function queryDatabase(databaseId, token, startCursor) {
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
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message ?? `Notion API 오류 (${res.status})`);
  }
  return res.json();
}

/**
 * Notion property에서 순수 텍스트 추출
 */
function getText(prop) {
  if (!prop) return "";
  switch (prop.type) {
    case "title":
      return prop.title.map((t) => t.plain_text).join("").trim();
    case "rich_text":
      return prop.rich_text.map((t) => t.plain_text).join("").trim();
    case "date":
      return prop.date?.start ?? "";
    case "select":
      return prop.select?.name ?? "";
    case "number":
      return String(prop.number ?? "");
    default:
      return "";
  }
}

/**
 * 날짜 문자열을 YYYY-MM-DD 형식으로 정규화
 * 입력 예: "2026- 04-13 (월)", "2026-04-13"
 */
function parsePublishDate(raw) {
  if (!raw) throw new Error("date 컬럼 값이 비어 있어요.");
  const cleaned = raw.replace(/\s+/g, "").replace(/\([^)]+\)/g, "");
  const m = cleaned.match(/(\d{4})-0*(\d{1,2})-0*(\d{1,2})/);
  if (!m) throw new Error(`날짜 형식을 파싱할 수 없어요: "${raw}"`);
  const [, y, mo, d] = m;
  return `${y}-${mo.padStart(2, "0")}-${d.padStart(2, "0")}`;
}

/**
 * property 객체에서 대소문자 무시하고 컬럼 탐색
 */
function findProp(props, ...keys) {
  for (const key of keys) {
    if (props[key]) return props[key];
    const lower = key.toLowerCase();
    const found = Object.keys(props).find((k) => k.toLowerCase() === lower);
    if (found) return props[found];
  }
  return null;
}

/**
 * Notion Database를 읽어 Content 도큐먼트 배열로 변환
 * 예상 컬럼: date, word, word_ko, example_1, example_1_ko, example_2, example_2_ko [, example_3, example_3_ko]
 */
export async function fetchNotionRows(notionUrl, notionToken) {
  const databaseId = parseDatabaseId(notionUrl);

  // 페이지네이션 처리
  const pages = [];
  let cursor;
  do {
    const res = await queryDatabase(databaseId, notionToken, cursor);
    pages.push(...(res.results ?? []));
    cursor = res.has_more ? res.next_cursor : undefined;
  } while (cursor);

  if (pages.length === 0) return [];

  const items = [];
  for (const page of pages) {
    const p = page.properties;

    const dateRaw = getText(findProp(p, "date", "Date", "날짜"));
    const word = getText(findProp(p, "word", "Word", "단어"));
    const wordKo = getText(findProp(p, "word_ko", "Word_ko", "Word_Ko", "뜻", "한국어"));

    if (!dateRaw || !word || !wordKo) continue;

    let publishDate;
    try {
      publishDate = parsePublishDate(dateRaw);
    } catch {
      continue;
    }
    const monthKey = publishDate.slice(0, 7);

    const examples = [];
    for (let i = 1; i <= 3; i++) {
      const en = getText(findProp(p, `example_${i}`, `Example_${i}`, `example${i}`));
      const ko = getText(findProp(p, `example_${i}_ko`, `Example_${i}_ko`, `example${i}ko`));
      if (en && ko) examples.push({ en, ko });
    }

    items.push({
      publishDate,
      monthKey,
      word,
      meaning: { ko: wordKo, en: word },
      examples,
      isActive: true,
    });
  }

  return items;
}
