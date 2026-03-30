# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

Web crawler for 洛克王国 (Roco Kingdom) data from the BiliGame wiki (`https://wiki.biligame.com/rocom`). Scrapes pet and skill data using the MediaWiki API and raw wikitext endpoints, then outputs:
- `output/pets/<name>.json` — one JSON file per pet (enriched with skill details)
- `output/skills.csv` — all skills as CSV

## Run Commands

```sh
bun src/index.ts          # Full pipeline: skills → pets → enrichment → save
bun src/crawl-skills.ts   # Skills only
bun src/crawlers/pet-detail.ts    # Single pet test (import.meta.main guard)
bun src/crawlers/skill-detail.ts  # Single skill test (import.meta.main guard)
```

## Crawl Parameters

Tunable in `src/config.ts`:
- `BATCH_SIZE` — concurrent requests per batch (default 20)
- `BATCH_DELAY` — ms between batches (default 2000)
- `MAX_DURATION` — hard timeout in ms (default 10 min)

## Gotchas

- **HTTP 567** = wiki rate limit; crawlers retry with exponential backoff (up to 3 retries)
- **Filenames** with `/` in pet/skill names must be encoded as `%2F` when writing to disk
- **Wikitext templates**: pet data lives in `{{精灵信息|...}}`, skill data in `{{技能信息|...}}`; parsed by splitting on `\n|` then finding `key=value`
- **Failed items** are re-queued automatically; the crawl loop continues until empty or timeout
