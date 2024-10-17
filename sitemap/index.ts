import * as cheerio from "https://esm.sh/cheerio";

async function fetchPage(url) {
  try {
    const response = await fetch(url);
    const body = await response.text();
    return body;
  } catch (error) {
    console.error(`Error fetching ${url}:`, error);
    return null;
  }
}

function extractLinks(html, baseUrl) {
  const $ = cheerio.load(html);
  const links = [];
  $("a").each((index, element) => {
    let href = $(element).attr("href");
    if (href) {
      href = new URL(href, baseUrl);
      links.push(href);
    }
  });
  return links;
}

async function crawl(
  url,
  depth = 1,
  context = { maxLinks: 100, result: new Set() }
) {
  if (depth <= 0 || context.maxLinks <= 0) {
    return;
  }

  console.log(`Crawling ${url}...`);
  const html = await fetchPage(url);
  if (!html) {
    return;
  }

  const links = extractLinks(html, url)
    .filter((url) => {
      if (!context.includeHost || context.includeHost.includes(url.host)) {
        return true;
      }
      return false;
    })
    .map((i) => i.toString())
    .filter((i) => {
      return !context.result.has(i) || !context?.ignoreLink(i);
    })
    .sort((a, b) => a.length - b.length);
  console.log(`Found ${links.length} links on ${url}`);

  links.forEach((element) => {
    context.result.add(element);
  });
  if (context.maxLinks <= context.result.size) return;

  for (const link of links) {
    await crawl(link, depth - 1, context);
  }
}
const result = new Set();
await crawl("https://deno.land", 3, {
  maxLinks: 100,
  result,
  includeHost: ["deno.land"],
  ignoreLinks,
});
console.log(result);
