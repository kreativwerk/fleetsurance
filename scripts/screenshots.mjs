import { chromium } from "playwright";
const out = "/home/user/fleetsurance/.impeccable/review";
const base = "http://localhost:3000";
const browser = await chromium.launch().catch(() => chromium.launch({ executablePath: "/opt/pw-browsers/chromium" }));
const seiten = [["login","/login"],["mehr","/mehr"],["uebersicht","/uebersicht"],["flotte","/flotte"],["schaden","/schaeden/SF-2026-0142"],["schaeden","/schaeden"]];
for (const [vp, w, h, mobile] of [["desktop",1440,900,false],["mobile",390,844,true]]) {
  const ctx = await browser.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: 2, isMobile: mobile, hasTouch: mobile, reducedMotion: "reduce", locale: "de-DE", timezoneId: "Europe/Berlin" });
  const page = await ctx.newPage();
  const errors = [];
  page.on("pageerror", e => errors.push(e.message));
  page.on("console", m => { if (m.type() === "error") errors.push(m.text()); });
  for (const [name, path] of seiten) {
    await page.goto(base + path, { waitUntil: "networkidle" });
    await page.waitForTimeout(400);
    await page.screenshot({ path: `${out}/${vp}-${name}.png`, fullPage: true });
  }
  if (mobile) {
    await page.goto(base + "/schaeden/SF-2026-0142", { waitUntil: "networkidle" });
    await page.getByRole("tab", { name: "Chat" }).click();
    await page.waitForTimeout(300);
    await page.screenshot({ path: `${out}/mobile-schaden-chat.png` });
  }
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  console.log(vp, "errors:", errors.length ? errors : "none", "overflow:", overflow);
  await ctx.close();
}
await browser.close();
