import { makeHeaders } from "../config";

export interface SkillDetail {
  name: string;
  element: string;
  category: string;
  cost: string;
  power: string;
  effect: string;
}

async function fetchWikitext(name: string, retries = 3): Promise<string> {
  const url = `https://wiki.biligame.com/rocom/index.php?title=${encodeURIComponent(name)}&action=raw`;
  for (let i = 0; i < retries; i++) {
    const res = await fetch(url, { headers: makeHeaders() });
    if (res.status === 567) {
      await Bun.sleep(3000 * (i + 1));
      continue;
    }
    return res.text();
  }
  return "";
}

function parseWikitext(wikitext: string): SkillDetail | null {
  const match = wikitext.match(/\{\{技能信息\s*\|([\s\S]*?)\}\}/);
  if (!match) return null;

  const data = new Map<string, string>();
  for (const pair of match[1]!.split(/\n\|/)) {
    const eqIndex = pair.indexOf("=");
    if (eqIndex === -1) continue;
    data.set(pair.slice(0, eqIndex).trim(), pair.slice(eqIndex + 1).trim());
  }

  return {
    name: "",
    element: data.get("属性") ?? "",
    category: data.get("技能类别") ?? "",
    cost: data.get("耗能") ?? "",
    power: data.get("威力") ?? "",
    effect: data.get("效果") ?? "",
  };
}

export async function crawlSkill(name: string): Promise<SkillDetail | null> {
  const wikitext = await fetchWikitext(name);
  const detail = parseWikitext(wikitext);
  if (detail) detail.name = name;
  return detail;
}

if (import.meta.main) {
  const skill = await crawlSkill("暗突袭");
  console.log(JSON.stringify(skill, null, 2));
}
