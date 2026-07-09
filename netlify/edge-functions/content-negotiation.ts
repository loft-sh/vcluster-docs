import type { Config } from "@netlify/edge-functions";

// DOC-1321: serve .md siblings when Accept: text/markdown is requested.
// The @signalwire/docusaurus-plugin-llms-txt plugin emits <path>.md next
// to every HTML page for routes listed in llms.txt. When a route has no
// .md sibling (versioned docs, search, assets), fall through to HTML.

const MD_EXTENSION = ".md";

export default async (request: Request) => {
  const accept = request.headers.get("accept") ?? "";
  if (!accept.toLowerCase().includes("text/markdown")) {
    return;
  }

  const url = new URL(request.url);
  const path = url.pathname;

  if (path.endsWith(MD_EXTENSION)) {
    return;
  }

  const lastSegment = path.split("/").pop() ?? "";
  if (lastSegment.includes(".")) {
    return;
  }

  const trimmed = path.endsWith("/") && path.length > 1
    ? path.slice(0, -1)
    : path;
  const candidates = [
    `${trimmed}${MD_EXTENSION}`,
    `${trimmed}/index${MD_EXTENSION}`,
  ];

  for (const candidate of candidates) {
    const candidateUrl = new URL(candidate + url.search, url.origin);
    const response = await fetch(candidateUrl, { redirect: "manual" });
    if (response.status === 200) {
      return new Response(response.body, {
        status: 200,
        headers: {
          "content-type": "text/markdown; charset=utf-8",
          "vary": "Accept",
          "cache-control":
            response.headers.get("cache-control") ??
            "public, max-age=0, must-revalidate",
          "x-content-source": "md-edge",
        },
      });
    }
  }
};

export const config: Config = {
  path: "/docs/*",
};
