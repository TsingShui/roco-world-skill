import { load } from "cheerio";

interface PetDetail {
  no: string;
  name: string;
  element: string;
  element2: string;
  hp: number;
  physicalAttack: number;
  magicAttack: number;
  physicalDefense: number;
  magicDefense: number;
  speed: number;
  ability: string;
  abilityDesc: string;
  description: string;
  skills: string[];
  skillUnlockLevels: number[];
  size: string;
  weight: string;
}

async function fetchPage(url: string): Promise<string> {
  const res = await fetch(url, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
    },
  });
  return res.text();
}

function parseWikitext(wikitext: string): PetDetail | null {
  // 匹配 {{精灵信息|...}}
  const match = wikitext.match(/\{\{精灵信息\s*\|([\s\S]*?)\}\}/);
  if (!match) return null;

  const raw = match[1]!;

  // 解析 key=value 对
  const data = new Map<string, string>();
  const pairs = raw.split(/\|/);
  for (const pair of pairs) {
    const eqIndex = pair.indexOf("=");
    if (eqIndex === -1) continue;
    const key = pair.slice(0, eqIndex).trim();
    const value = pair.slice(eqIndex + 1).trim();
    data.set(key, value);
  }

  // 提取编号 (从页面标题或URL获取)
  const noMatch = wikitext.match(/NO(\d+)/);
  const no = noMatch?.[1] ?? "";

  // 提取技能列表
  const skillsStr = data.get("技能") ?? "";
  const skills = skillsStr
    .split(/,/)
    .map((s) => s.trim())
    .filter(Boolean);

  const levelsStr = data.get("技能解锁等级") ?? "";
  const skillUnlockLevels = levelsStr
    .split(/,/)
    .map((s) => parseInt(s.trim()))
    .filter((n) => !isNaN(n));

  return {
    no,
    name: data.get("精灵名称") ?? "",
    element: data.get("主属性") ?? "",
    element2: data.get("2属性") ?? "",
    hp: parseInt(data.get("生命") ?? "0"),
    physicalAttack: parseInt(data.get("物攻") ?? "0"),
    magicAttack: parseInt(data.get("魔攻") ?? "0"),
    physicalDefense: parseInt(data.get("物防") ?? "0"),
    magicDefense: parseInt(data.get("魔防") ?? "0"),
    speed: parseInt(data.get("速度") ?? "0"),
    ability: data.get("特性") ?? "",
    abilityDesc: data.get("特性描述") ?? "",
    description: data.get("精灵描述") ?? "",
    skills,
    skillUnlockLevels,
    size: data.get("体型") ?? "",
    weight: data.get("重量") ?? "",
  };
}

export async function crawlPet(name: string): Promise<PetDetail | null> {
  const url = `https://wiki.biligame.com/rocom/index.php?title=${encodeURIComponent(name)}&action=edit`;
  const html = await fetchPage(url);
  const $ = load(html);
  const wikitext = $("textarea").text();
  return parseWikitext(wikitext);
}

// 入口
if (import.meta.main) {
  const pet = await crawlPet("炽心勇狮");
  console.log(JSON.stringify(pet, null, 2));
}
