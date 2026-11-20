#!/usr/bin/env node
// Print algolia/docsearch.config.js as the JSON body the Algolia Crawler API
// expects for PATCH /api/1/crawlers/{id}/config. Functions (recordExtractor)
// become {"__type": "function", "source": "..."}.
//
// docsearch.config.js stays the single source of truth for the crawler, so the
// runbook payload can't drift from it (DOC-2024). The template keeps
// placeholder credentials; real values come from the environment:
//
//   ALGOLIA_APP_ID=... CRAWLER_INDEXING_API_KEY=... \
//     node algolia/crawler-config-json.mjs > /tmp/vcluster-crawler-config.json
//
// CRAWLER_INDEXING_API_KEY is the indexing key set inside the crawler config,
// not the Admin API key and not the crawler user's API key.
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import vm from "node:vm";

const templatePath = fileURLToPath(new URL("./docsearch.config.js", import.meta.url));
const appId = process.env.ALGOLIA_APP_ID;
const apiKey = process.env.CRAWLER_INDEXING_API_KEY;

if (!appId || !apiKey) {
  console.error("Set ALGOLIA_APP_ID and CRAWLER_INDEXING_API_KEY first.");
  process.exit(1);
}

let config;
class Crawler {
  constructor(cfg) {
    config = cfg;
  }
}
vm.runInNewContext(readFileSync(templatePath, "utf8"), { Crawler }, { filename: templatePath });

if (!config) {
  console.error(`No new Crawler({...}) call found in ${templatePath}`);
  process.exit(1);
}

config.appId = appId;
config.apiKey = apiKey;

const json = JSON.stringify(
  config,
  (_key, value) =>
    typeof value === "function" ? { __type: "function", source: value.toString() } : value,
  2,
);
process.stdout.write(`${json}\n`);
