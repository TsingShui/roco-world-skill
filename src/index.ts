import { mkdir } from "node:fs/promises";
import { crawlAllPets } from "./crawlers/pet-index";
import { crawlPet } from "./crawlers/pet-detail";
import { crawlSkillIndex } from "./crawlers/skill-index";
import { crawlSkill, type SkillDetail } from "./crawlers/skill-detail";
import { BATCH_SIZE, BATCH_DELAY, MAX_DURATION } from "./config";

const OUTPUT_DIR = "./output/pets";

async function crawlAll<T>(
  names: string[],
  fetcher: (name: string) => Promise<T | null>,
  label: string
): Promise<Map<string, T>> {
  const startTime = Date.now();
  const result = new Map<string, T>();
  let queue = [...names];
  let completed = 0;

  while (queue.length > 0) {
    if (Date.now() - startTime > MAX_DURATION) {
      console.log(`[timeout] ${queue.length} ${label} remaining.`);
      break;
    }

    const batch = queue.splice(0, BATCH_SIZE);
    const failed: string[] = [];

    await Promise.all(
      batch.map(async (name) => {
        const detail = await fetcher(name);
        completed++;
        if (detail) {
          result.set(name, detail);
          console.log(`[${completed}/${names.length}] ${label}: ${name} OK`);
        } else {
          failed.push(name);
          console.log(`[${completed}/${names.length}] ${label}: ${name} FAIL`);
        }
      })
    );

    if (failed.length > 0) {
      queue.push(...failed);
      console.log(`  -> ${failed.length} failed, re-queued`);
    }

    if (queue.length > 0) await Bun.sleep(BATCH_DELAY);
  }

  return result;
}

async function main() {
  await mkdir(OUTPUT_DIR, { recursive: true });

  console.log("Step 1: Crawling skill index...");
  const skillNames = await crawlSkillIndex();
  console.log(`Found ${skillNames.length} skills\n`);

  console.log("Step 2: Crawling skill details...");
  const skillMap = await crawlAll<SkillDetail>(skillNames, crawlSkill, "skill");
  console.log(`Loaded ${skillMap.size} skills\n`);

  console.log("Step 3: Crawling pet index...");
  const petNames = await crawlAllPets();
  console.log(`Found ${petNames.length} pets\n`);

  console.log("Step 4: Crawling pet details...");
  const petMap = await crawlAll(petNames, crawlPet, "pet");

  console.log("\nStep 5: Saving skills to CSV...");
  const csvHeader = "name,element,category,cost,power,effect";
  const csvRows = [...skillMap.values()].map((s) =>
    [s.name, s.element, s.category, s.cost, s.power, s.effect]
      .map((v) => `"${String(v).replace(/"/g, '""')}"`)
      .join(",")
  );
  await Bun.write("./output/skills.csv", [csvHeader, ...csvRows].join("\n"));
  console.log(`Saved ${skillMap.size} skills to output/skills.csv\n`);

  console.log("Step 6: Enriching pets with skill details...");
  let saved = 0;
  for (const [name, pet] of petMap) {
    pet.skillDetails = pet.skills.map((s) => skillMap.get(s)).filter(Boolean) as SkillDetail[];
    pet.bloodlineSkillDetails = pet.bloodlineSkills.map((s) => skillMap.get(s)).filter(Boolean) as SkillDetail[];
    pet.learnableSkillStoneDetails = pet.learnableSkillStones.map((s) => skillMap.get(s)).filter(Boolean) as SkillDetail[];

    const filename = `${name}.json`.replace(/\//g, "%2F");
    await Bun.write(`${OUTPUT_DIR}/${filename}`, JSON.stringify(pet, null, 2));
    saved++;
  }

  console.log(`\nDone: ${saved} pets saved to ${OUTPUT_DIR}/`);
}

main().catch(console.error);
