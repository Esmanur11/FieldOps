// Ad-hoc browser driver for agents to launch, click through, and screenshot the running
// FieldOps app. Not a Playwright test (filename doesn't match *.spec.*/*.test.*, so
// `npx playwright test` ignores it) — it's a REPL-less script you run once per session.
//
// Requires: the API on :5050 and the Vite dev server on :5173 already running (see
// ../../.claude/skills/run-fieldops/SKILL.md). Must be run from inside client/ (or via
// `node client/tests/manual-driver.mjs`) so the bare `@playwright/test` import resolves
// against client/node_modules — it will NOT resolve from elsewhere in the repo.
//
// Usage: node tests/manual-driver.mjs [step ...]
//   No args        → runs every step below, in order.
//   One or more     → runs only the named steps (still in the order listed here), e.g.:
//   step names        node tests/manual-driver.mjs login materials workorders
//
// Screenshots land in test-results/manual-driver/ (gitignored, same as Playwright's own
// test-results/). Exits non-zero and leaves a FAILURE-<step>.png if a step throws.

import { chromium } from "@playwright/test";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const shotDir = path.join(__dirname, "..", "test-results", "manual-driver");
fs.mkdirSync(shotDir, { recursive: true });

const BASE_URL = process.env.FIELDOPS_BASE_URL ?? "http://localhost:5173";
const ADMIN_USERNAME = process.env.FIELDOPS_ADMIN_USERNAME ?? "admin";
const ADMIN_PASSWORD = process.env.FIELDOPS_ADMIN_PASSWORD ?? "SifreniSecTemel123!";

const requestedSteps = process.argv.slice(2);
const consoleErrors = [];
let shotN = 0;

async function shot(page, name) {
  shotN += 1;
  const filePath = path.join(shotDir, `${String(shotN).padStart(2, "0")}-${name}.png`);
  await page.screenshot({ path: filePath, fullPage: true });
  console.log(`SHOT ${filePath}`);
}

const steps = {
  async login(page) {
    await page.goto("/login");
    await page.getByLabel("Kullanıcı Adı").fill(ADMIN_USERNAME);
    await page.getByLabel("Şifre").fill(ADMIN_PASSWORD);
    await page.getByRole("button", { name: "Giriş Yap" }).click();
    await page.waitForURL("/");
    await page.waitForSelector("text=Toplam Şantiye");
    await shot(page, "dashboard");
    console.log("OK: login + dashboard KPI cards rendered");
  },

  async materials(page) {
    await page.goto("/materials");
    await page.waitForSelector("text=Malzeme Kataloğu");
    const name = `Driver Malzeme ${Date.now()}`;
    await page.getByRole("button", { name: "+ Yeni Malzeme Ekle" }).click();
    await page.getByLabel("İsim").fill(name);
    await page.getByLabel("Birim", { exact: true }).fill("adet");
    await page.getByRole("button", { name: "Kaydet" }).click();
    await page.waitForSelector(`text=${name}`);
    await shot(page, "materials-created");
    console.log(`OK: material "${name}" created and visible in catalog`);
  },

  async machines(page) {
    await page.goto("/machines");
    await page.waitForSelector(".grid, table");
    // Cards navigate via onClick, not <a href> -- and the header's username paragraph
    // shares the exact same Tailwind classes as a card title, so the locator must be
    // scoped to the card grid or it silently clicks the header instead of a machine.
    await page.locator(".grid p.font-medium.text-white").first().click();
    await page.waitForSelector("text=Bakım Tahmini");
    await shot(page, "machine-detail");
    await page.getByRole("button", { name: "Şimdi Yeniden Hesapla" }).click();
    await page.waitForTimeout(800);
    await shot(page, "machine-prediction-recalculated");
    console.log("OK: machine detail loaded, maintenance prediction recalculated");
  },

  async audits(page) {
    await page.goto("/audits");
    await page.waitForSelector("text=Yeni Denetim Ekle");
    const auditType = `Driver Denetim ${Date.now()}`;
    await page.getByRole("button", { name: "+ Yeni Denetim Ekle" }).click();
    await page.getByLabel("Tarih").fill(new Date().toISOString().slice(0, 10));
    await page.getByLabel("Tip").fill(auditType);
    await page.getByRole("button", { name: "Kaydet" }).click();
    await page.waitForTimeout(500);
    await page.getByPlaceholder("Şantiye, denetçi veya tipe göre ara...").fill(auditType);
    await page.waitForSelector(`text=${auditType}`);
    await page.getByText(auditType).click();
    await page.waitForSelector("text=+ Bulgu Ekle");

    const findingDesc = `Driver kritik bulgu ${Date.now()}`;
    await page.getByRole("button", { name: "+ Bulgu Ekle" }).click();
    await page.getByLabel("Önem Derecesi").selectOption({ label: "critical" });
    await page.getByLabel("Açıklama").fill(findingDesc);
    await page.getByRole("button", { name: "Kaydet" }).click();
    await page.waitForSelector(`text=${findingDesc}`);
    await shot(page, "audit-critical-finding");
    console.log(`OK: audit "${auditType}" + critical finding "${findingDesc}" created`);

    return { findingDesc };
  },

  async workorders(page, ctx) {
    // Proves the cross-module wiring: a critical audit finding must auto-generate a work
    // order with zero manual action. Falls back to a generic screenshot if `audits` wasn't
    // run first in this invocation (no finding description to search for).
    await page.goto("/work-orders");
    await page.waitForSelector("text=+ Yeni İş Emri");
    if (ctx.findingDesc) {
      await page.getByPlaceholder("Şantiye veya başlığa göre ara...").fill(ctx.findingDesc);
      await page.waitForSelector("text=Denetim Bulgusu");
      console.log("OK: work order auto-generated from the critical audit finding");
    }
    await shot(page, "workorders-list");
  },
};

const order = ["login", "materials", "machines", "audits", "workorders"];
const toRun = requestedSteps.length > 0 ? order.filter((s) => requestedSteps.includes(s)) : order;

const browser = await chromium.launch();
const page = await browser.newPage({ baseURL: BASE_URL });
page.on("console", (msg) => {
  if (msg.type() === "error") consoleErrors.push(`[console] ${msg.text()}`);
});
page.on("pageerror", (err) => consoleErrors.push(`[pageerror] ${err.message}`));

const ctx = {};
try {
  for (const name of toRun) {
    const result = await steps[name](page, ctx);
    if (result) Object.assign(ctx, result);
  }

  console.log("\n=== CONSOLE ERRORS ===");
  console.log(consoleErrors.length === 0 ? "none" : consoleErrors.join("\n"));
} catch (err) {
  await shot(page, "FAILURE");
  console.error("DRIVER FAILED:", err);
  process.exitCode = 1;
} finally {
  await browser.close();
}
