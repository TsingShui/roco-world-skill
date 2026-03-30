import { API_URL, makeHeaders } from "../config";

async function fetchCategoryMembers(cmcontinue?: string): Promise<string[]> {
  const url = new URL(API_URL);
  url.searchParams.set("action", "query");
  url.searchParams.set("list", "categorymembers");
  url.searchParams.set("cmtitle", "Category:精灵");
  url.searchParams.set("cmlimit", "500");
  url.searchParams.set("format", "json");
  if (cmcontinue) url.searchParams.set("cmcontinue", cmcontinue);

  const res = await fetch(url, { headers: makeHeaders() });
  const data = await res.json();
  const names = (data.query?.categorymembers ?? [])
    .map((x: any) => x.title as string)
    .filter((title: string) => !title.startsWith("模板:"));
  if (data.continue?.cmcontinue) {
    names.push(...(await fetchCategoryMembers(data.continue.cmcontinue)));
  }
  return names;
}

export async function crawlAllPets(): Promise<string[]> {
  const names = await fetchCategoryMembers();
  console.log(`Found ${names.length} pets`);
  return names;
}

if (import.meta.main) {
  const pets = await crawlAllPets();
  console.log(JSON.stringify(pets.slice(0, 10), null, 2));
}
