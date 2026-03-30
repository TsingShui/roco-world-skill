import UserAgent from "user-agents";

export const BATCH_SIZE = 20;
export const BATCH_DELAY = 2000;
export const MAX_DURATION = 10 * 60 * 1000;

export const BASE_URL = "https://wiki.biligame.com/rocom";
export const API_URL = `${BASE_URL}/api.php`;

export const makeHeaders = () => ({
  "User-Agent": new UserAgent().toString(),
  "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
  "Accept-Language": "zh-CN,zh;q=0.9",
  "Referer": `${BASE_URL}/`,
});
