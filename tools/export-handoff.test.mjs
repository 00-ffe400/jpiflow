import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import { mkdtemp, readFile, rm } from "node:fs/promises";
import { createServer } from "node:http";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { test } from "node:test";
import { promisify } from "node:util";
import { fileURLToPath } from "node:url";

const run = promisify(execFile);
const script = fileURLToPath(new URL("./export-handoff.mjs", import.meta.url));
const production = "https://jpi365flow.com";
const pages = ["index.html", "telemedicine.html", "pacs.html"];

function assertDestinations(html, origin, page) {
  const paths = ["/account/profile", "/services/telerad#pricing", "/terms", "/privacy", "/refund"];
  if (page === "telemedicine.html") paths.push("/account/balance");
  for (const path of paths) {
    assert.ok(
      html.includes(`href="${origin}${path}" data-landing-path="${path}" target="_top"`),
      `${page} → ${path}`,
    );
  }
}

test("the handoff uses the selected origin for every official link and both price feeds", async (t) => {
  const requests = [];
  const api = createServer((req, res) => {
    const url = new URL(req.url, "http://localhost");
    requests.push([url.pathname, JSON.parse(url.searchParams.get("input")).currency]);
    res.writeHead(503).end();
  });
  await new Promise((resolve) => api.listen(0, "127.0.0.1", resolve));
  t.after(() => new Promise((resolve) => api.close(resolve)));
  const origin = `http://127.0.0.1:${api.address().port}`;
  const temp = await mkdtemp(join(tmpdir(), "handoff-test-"));
  t.after(() => rm(temp, { recursive: true, force: true }));
  const output = join(temp, "preview");
  await run(process.execPath, [script, output], {
    env: { ...process.env, LANDING_PUBLIC_ORIGIN: origin + "/" },
  });
  for (const page of pages) {
    const source = await readFile(new URL("../dist/" + page, import.meta.url), "utf8");
    const exported = await readFile(join(output, "dist", page), "utf8");
    assertDestinations(source, production, page);
    assertDestinations(exported, origin, page);
    assert.ok(!exported.includes(production));
  }
  const expected = ["pricing.getScheduleV2", "topUp.packages"].flatMap((procedure) =>
    ["KRW", "USD"].map((currency) => [`/api/trpc/${procedure}`, currency]),
  );
  assert.deepEqual(requests.sort(), expected.sort());
  const prices = await readFile(join(output, "dist/landing-prices.js"), "utf8");
  assert.ok(!prices.includes('"modality"'));
  assert.equal(
    JSON.parse(await readFile(join(output, ".openai/hosting.json"))).static.directory,
    "dist",
  );
  await assert.rejects(
    run(process.execPath, [script, join(temp, "invalid")], {
      env: { ...process.env, LANDING_PUBLIC_ORIGIN: origin + "/account" },
    }),
  );
});
