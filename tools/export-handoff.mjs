import { cp, mkdir, mkdtemp, readFile, readdir, rm, writeFile } from "node:fs/promises";
import { basename, dirname, join, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";
import { loadPublishedPrices } from "./handoff-prices.mjs";

const source = fileURLToPath(new URL("../dist/", import.meta.url)).replace(/[/\\]$/, "");
const defaultOrigin = "https://jpi365flow.com";

function landingOrigin(value) {
  const url = new URL(value);
  const local = ["localhost", "127.0.0.1", "[::1]"].includes(url.hostname);
  if (
    !value.trim() ||
    value.trim() !== value ||
    !/^https?:\/\/[^/?#\\]+\/?$/.test(value) ||
    (url.protocol !== "https:" && !(local && url.protocol === "http:")) ||
    url.username ||
    url.password ||
    url.pathname !== "/" ||
    url.search ||
    url.hash
  ) {
    throw new Error(
      "LANDING_PUBLIC_ORIGIN에는 경로 없는 HTTPS 주소를 입력하세요. 로컬 테스트에서는 HTTP도 사용할 수 있습니다.",
    );
  }
  return url.origin;
}

async function exportHandoff() {
  const origin = landingOrigin(process.env.LANDING_PUBLIC_ORIGIN ?? defaultOrigin);
  if (process.argv.length > 3)
    throw new Error("사용법: node tools/export-handoff.mjs [새 출력 폴더]");
  let output;
  const requested = process.argv[2];
  if (requested) {
    output = resolve(requested);
    if (output === source || output.startsWith(source + sep))
      throw new Error("출력 폴더는 dist 밖에 지정하세요.");
    await mkdir(dirname(output), { recursive: true });
    await mkdir(output);
  } else {
    const outputs = join(dirname(source), "outputs");
    await mkdir(outputs, { recursive: true });
    output = await mkdtemp(join(outputs, "handoff-"));
  }
  try {
    const site = join(output, "dist");
    await cp(source, site, { recursive: true });
    await mkdir(join(output, ".openai"));
    await cp(
      join(dirname(source), ".openai", "hosting.json"),
      join(output, ".openai", "hosting.json"),
    );
    for (const entry of await readdir(source)) {
      if (!entry.endsWith(".html")) continue;
      const file = join(site, entry);
      const html = await readFile(file, "utf8");
      const updated = html.replace(
        /href="([^"]*)" data-landing-path="([^"]+)"/g,
        (_, href, path) => {
          const url = new URL(path, origin);
          if (!path.startsWith("/") || url.origin !== origin || href !== defaultOrigin + path) {
            throw new Error(`공식 랜딩 링크를 확인하세요: ${basename(file)} ${path}`);
          }
          return `href="${url.href}" data-landing-path="${path}"`;
        },
      );
      await writeFile(file, updated);
    }
    const prices = await loadPublishedPrices(origin);
    for (const currency of ["KRW", "USD"]) {
      if (!prices[currency]?.rates?.length || !prices[currency]?.packages?.length) {
        console.warn(
          `${currency} 가격표 또는 충전 상품을 읽을 수 없어 해당 통화에는 공식 요금 링크를 표시합니다.`,
        );
      }
    }
    const payload = JSON.stringify(prices).replaceAll("<", "\\u003c");
    await writeFile(join(site, "landing-prices.js"), `window.handoffPrices = ${payload};\n`);
    console.log(output);
  } catch (error) {
    await rm(output, { recursive: true, force: true });
    throw error;
  }
}

exportHandoff().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
