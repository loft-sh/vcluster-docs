#!/usr/bin/env node

import fs from "node:fs"
import path from "node:path"

const repoRoot = process.cwd()
const contractPath = path.join(repoRoot, "config/platform-ui-links.contract.json")
const baseUrl = process.env.DOCS_BASE_URL ?? "https://www.vcluster.com"

if (!fs.existsSync(contractPath)) {
  console.error(`Missing contract file: ${contractPath}`)
  process.exit(1)
}

const contract = JSON.parse(fs.readFileSync(contractPath, "utf8"))
const links = Array.isArray(contract.links) ? contract.links : []
const verify = contract.verify ?? {}

const platformVersion = process.env.PLATFORM_VERSION ?? verify.platformVersion ?? "4.6.0"
const vclusterVersions =
  process.env.VCLUSTER_VERSIONS?.split(",").filter(Boolean) ??
  (Array.isArray(verify.vclusterVersions) ? verify.vclusterVersions : ["0.29.0"])
const requestTimeoutMs = Number.parseInt(process.env.DOCS_VALIDATE_TIMEOUT_MS ?? "15000", 10)
const maxRetries = Number.parseInt(process.env.DOCS_VALIDATE_RETRIES ?? "3", 10)

function parseVersion(version) {
  return String(version)
    .split(".")
    .map((part) => Number.parseInt(part, 10) || 0)
}

function isVersionAtLeast(version, minVersion) {
  if (!minVersion) return true
  const current = parseVersion(version)
  const min = parseVersion(minVersion)
  const size = Math.max(current.length, min.length)
  for (let index = 0; index < size; index += 1) {
    const a = current[index] ?? 0
    const b = min[index] ?? 0
    if (a > b) return true
    if (a < b) return false
  }
  return true
}

function toPermalinkUrl(product, slug, version) {
  if (version) {
    return `${baseUrl}/docs/platform-ui-link/${product}/${slug}/${version}`
  }
  return `${baseUrl}/docs/platform-ui-link/${product}/${slug}`
}

function sleep(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms)
  })
}

async function assertAlive(key, label, url) {
  let lastError = ""

  for (let attempt = 1; attempt <= Math.max(1, maxRetries); attempt += 1) {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), requestTimeoutMs)

    try {
      const res = await fetch(url, {
        redirect: "follow",
        signal: controller.signal,
      })
      clearTimeout(timeout)

      if (res.status !== 200) {
        lastError = `[${key}] ${label} returned HTTP ${res.status}: ${url}`
      } else {
        const html = (await res.text()).toLowerCase()
        if (!html.includes("page not found")) {
          return ""
        }
        lastError = `[${key}] ${label} returned a not-found page: ${url}`
      }
    } catch (error) {
      clearTimeout(timeout)
      const message = error instanceof Error ? error.message : String(error)
      lastError = `[${key}] ${label} request failed: ${url} (${message})`
    }

    if (attempt < maxRetries) {
      await sleep(250 * attempt)
    }
  }

  return lastError
}

const errors = []

for (const link of links) {
  const latestUrl = toPermalinkUrl(link.product, link.slug)
  const latestErr = await assertAlive(link.key, "permalink latest", latestUrl)
  if (latestErr) errors.push(latestErr)

  const versions = link.product === "platform" ? [platformVersion] : vclusterVersions
  for (const version of versions) {
    if (!isVersionAtLeast(version, link.minVersion)) continue
    const versionedUrl = toPermalinkUrl(link.product, link.slug, version)
    const versionedErr = await assertAlive(
      link.key,
      `permalink versioned (${link.product} ${version})`,
      versionedUrl
    )
    if (versionedErr) errors.push(versionedErr)
  }
}

if (errors.length > 0) {
  console.error("Found unreachable platform-ui-link permalinks:")
  for (const error of errors) {
    console.error(`- ${error}`)
  }
  process.exit(1)
}

console.log("All platform-ui-link permalinks are reachable.")
