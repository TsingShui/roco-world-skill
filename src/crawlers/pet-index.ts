const BASE_URL = "https://wiki.biligame.com/rocom";
const CATEGORY_URL = `${BASE_URL}/index.php?title=分类:精灵`;

interface Pet {
  name: string;
  url: string;
}

async function fetchPage(url: string): Promise<string> {
  const res = await fetch(url, {
    headers: {
      "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
    },
  });
  return res.text();
}

function parsePets(html: string): Pet[] {
  const pets: Pet[] = [];
  // MediaWiki 分类页面结构：<li><a href="/rocom/精灵名称" title="...">精灵名称</a></li>
  const regex = /<li><a href="(\/rocom\/[^"]+)"[^>]*>([^<]+)<\/a><\/li>/g;
  let match;

  while ((match = regex.exec(html)) !== null) {
    // noUncheckedIndexedAccess: true 需要手动确保不是 undefined
    const url = "https://wiki.biligame.com" + match[1]!;
    const title = match[2]!;
    pets.push({ name: title, url });
  }

  return pets;
}

function getNextPageUrl(html: string): string | null {
  // 查找"下一页"链接，解码 HTML 实体
  const regex = /<a href="(\/rocom\/index\.php\?[^"]+)"[^>]*>下一页<\/a>/;
  const match = regex.exec(html);
  if (match) {
    // 解码 &amp; -> &
    const decoded = match[1]!.replace(/&amp;/g, "&");
    return "https://wiki.biligame.com" + decoded;
  }
  return null;
}

export async function crawlAllPets(): Promise<Pet[]> {
  const allPets: Pet[] = [];
  let currentUrl: string | null = CATEGORY_URL;

  while (currentUrl) {
    console.log(`Crawling: ${currentUrl}`);
    const html = await fetchPage(currentUrl);

    const pets = parsePets(html);
    allPets.push(...pets);
    console.log(`Found ${pets.length} pets on this page`);

    currentUrl = getNextPageUrl(html);
  }

  return allPets;
}

// 入口
if (import.meta.main) {
  const pets = await crawlAllPets();
  console.log(`\nTotal: ${pets.length} pets`);
  console.log(JSON.stringify(pets.slice(0, 10), null, 2));
}
