import type { Page } from "@playwright/test";
import { expect, test, trackedEvents } from "./helpers";
import {
  LEVEL_PATH,
  acceptResume,
  hangUp,
  horizontalOverflow,
  openDecember,
  pickAndRun,
  pickUpCall,
  playQuarter,
  recordPhases,
  recordedPhases,
  seedGame,
  skipNews,
} from "./game-helpers";
import { PATH_A, PATH_C, playPath, type Path } from "../src/lib/game/__tests__/paths";
import { GAME_SAVE_KEYS } from "../src/lib/game/storage-keys";

/**
 * « S'ils reviennent », played through the interface — game plan §4.2 G8b,
 * GAME-BRIEF §7.2 P1, P6-P9, P10, P13, P15, P17, P18 and the plan's X28-X31.
 *
 * The long specs play whole years through the UI, clicking what a player
 * clicks, and compare what the screen says with the brief's fixture tables
 * (§6). Those tables are written out here as literals, not recomputed from
 * the engine: the unit tests already pin the engine to them, and this file
 * pins the SCREEN — a formatter or a view that drifted would pass a spec
 * that asked the engine what to expect.
 *
 * Reduced motion everywhere a spec is not about motion: the months then run
 * at once, the captions are whole, and nothing waits on a timer (plan §6.1).
 *
 * The game must be OPEN for this run (`GAME_ENABLED: "true"`, as in CI);
 * without it the level page is a 404, so the specs skip rather than fail for
 * a reason that says nothing about the game (R-11).
 *
 * Non-vacuity, measured: a `data-trust={game.trust}` slipped onto the
 * dashboard wrapper — invisible on screen — fails the four specs that walk
 * the year (`div data-trust="60"` in the report), and nothing else here.
 */
test.skip(process.env.GAME_ENABLED !== "true", "GAME_ENABLED is not \"true\" for this run — the level page is closed.");
test.use({ contextOptions: { reducedMotion: "reduce" } });

/** GAME-BRIEF §5.10 — the face is part of the contract, path by path. */
const FACE = {
  calm: { browL: "M140 55 L154 52", browR: "M166 52 L180 55", mouth: "M151 84 Q160 86 169 84" },
  firm: { browL: "M140 54 L154 54", browR: "M166 54 L180 54", mouth: "M151 84 L169 84" },
  angry: { browL: "M139 49 L155 57", browR: "M165 57 L181 49", mouth: "M151 86 Q160 81 169 86" },
  cold: { browL: "M140 56 L154 56", browR: "M166 56 L180 56", mouth: "M151 85 Q160 83 169 85" },
} as const;
type Mood = keyof typeof FACE;

/** One reference year, as GAME-BRIEF §6 tabulates it. */
interface Fixture {
  path: Path;
  /** The CEO's mood as each quarter's call opens. */
  moods: readonly [Mood, Mood, Mood, Mood];
  /** The card he asks for, first in the hand with its badge; none in the first quarter. */
  orders: readonly [null, string, string, string];
  /** Churn and patience on the dashboard at the end of each quarter. */
  churn: readonly [string, string, string, string];
  patience: readonly [string, string, string, string];
}

const A: Fixture = {
  path: PATH_A,
  moods: ["firm", "angry", "angry", "firm"],
  orders: [null, "pdef", "call", "bury"],
  churn: ["5,8 %", "5,7 %", "4,6 %", "4,0 %"],
  patience: ["51", "42", "46", "73"],
};

const C: Fixture = {
  path: PATH_C,
  moods: ["firm", "calm", "firm", "angry"],
  orders: [null, "call", "notice", "pdef"],
  churn: ["5.3%", "5.0%", "5.0%", "9.1%"],
  patience: ["67", "79", "57", "12"],
};

/** The figure a tile shows — its value span, not the tile, which also prints targets and deltas. */
function tileValue(page: Page, testId: string) {
  return page.getByTestId(testId).locator("[class*='__value']").first();
}

/**
 * X28 — before December, the trust and radar values exist nowhere in the
 * document: not in the two tiles (text or attributes), and not in any text
 * node or attribute anywhere on the page. The DOM is read, not a screenshot:
 * a value blurred in CSS but present in the markup would hide nothing from
 * anyone who opens devtools (plan §2.7).
 */
async function expectSecretsAbsent(page: Page) {
  for (const id of ["game-dash-trust", "game-dash-radar"]) {
    const tile = page.getByTestId(id);
    await expect(tile).toHaveAttribute("data-state", "hidden");
    // Its text and every attribute but the hashed class names and inline
    // style (a CSS module's hash is made of digits, a width is not a value).
    const carried = await tile.evaluate((el) =>
      [el, ...el.querySelectorAll("*")]
        .flatMap((node) => [...node.attributes].filter((a) => a.name !== "class" && a.name !== "style").map((a) => a.value))
        .concat(el.textContent ?? "")
        .join(" | "),
    );
    expect(carried, `${id} carries a figure`).not.toMatch(/\d/);
  }
  await expect(page.getByTestId("game-december")).toHaveCount(0);
  await expect(page.locator("[data-testid^='game-reveal-'], [data-testid='game-chart-trust']")).toHaveCount(0);

  const leaks = await page.evaluate(() => {
    // Node by node, never concatenated: a label next to an unrelated figure
    // two elements later is not a leak, a label with its figure is.
    const named = /(confiance|trust|radar)\D{0,20}\d/i;
    const found: string[] = [];
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    for (let n = walker.nextNode(); n; n = walker.nextNode()) {
      const text = n.textContent ?? "";
      if (named.test(text) || /\d+\s*\/\s*100\b/.test(text)) found.push(`text: ${text.trim().slice(0, 80)}`);
    }
    for (const el of document.body.querySelectorAll("*")) {
      for (const attr of el.attributes) {
        if (attr.name === "class" || attr.name === "style" || attr.name === "d" || attr.name === "viewBox") continue;
        // Name and value together: `data-trust="60"` names the counter in
        // the attribute and carries the figure in its value.
        const pair = `${attr.name}="${attr.value}"`;
        if (named.test(pair)) found.push(`${el.tagName.toLowerCase()} ${pair.slice(0, 80)}`);
      }
    }
    return found;
  });
  expect(leaks).toEqual([]);
}

/** P10 — the call opens with the mood of the fixture, on the face and on the frame. */
async function expectCallMood(page: Page, mood: Mood) {
  const call = page.getByTestId("game-call");
  await expect(call).toHaveAttribute("data-state", "open");
  await expect(call).toHaveAttribute("data-mood", mood);
  await expect(call.locator("#browL")).toHaveAttribute("d", FACE[mood].browL);
  await expect(call.locator("#browR")).toHaveAttribute("d", FACE[mood].browR);
  await expect(call.locator("#mouthShape")).toHaveAttribute("d", FACE[mood].mouth);
}

/** P6 — the card the CEO asks for heads the hand, with its badge; none in the first quarter. */
async function expectOrder(page: Page, order: string | null, badge: string) {
  const first = page.getByTestId("game-hand").locator("[data-testid^='game-card-']").first();
  if (order === null) {
    await expect(page.getByTestId("game-hand")).not.toContainText(badge);
    return;
  }
  await expect(first).toHaveAttribute("data-testid", `game-card-${order}`);
  await expect(first).toContainText(badge);
  // Only one card carries it.
  await expect(page.getByTestId("game-hand").getByText(badge, { exact: true })).toHaveCount(1);
}

test.describe("P1 — the first screen", () => {
  test("the call is open, no card on the desk yet, the dashboard at January's figures", async ({ page }) => {
    await page.goto(LEVEL_PATH.fr);
    await expect(page.getByTestId("game-desk")).toHaveAttribute("data-phase", "call");
    await expect(tileValue(page, "game-dash-churn")).toHaveText("6,0 %");
    await expect(tileValue(page, "game-dash-subs")).toHaveText("100 000");
    await expect(tileValue(page, "game-dash-mrr")).toHaveText("1,30 M€");
    await expect(tileValue(page, "game-dash-patience")).toHaveText("55");
    for (const id of ["game-dash-trust", "game-dash-radar"]) {
      await expect(page.getByTestId(id)).toContainText("pas sur ton dashboard");
    }
    // Antoine, 2026-09-25: the projects appear once the call is hung up, not
    // before — cards on the desk that could not be touched read as a bug.
    await expect(page.getByTestId("game-hand")).toHaveCount(0);
    await expectSecretsAbsent(page);
    await hangUp(page);
    const cards = page.locator("[data-testid^='game-card-']");
    expect(await cards.count()).toBeGreaterThan(4);
    for (const card of await cards.all()) await expect(card).toBeEnabled();
    // P2 — nothing on a card says what it pays.
    for (const text of await cards.allInnerTexts()) expect(text).not.toMatch(/%|[+−-]\s?\d/);
  });
});

test.describe("a whole year through the interface", () => {
  // Four quarters of clicks, a report read at each: comfortably under the
  // default budget on a production build, but not with room to spare on a
  // loaded CI runner.
  test.slow();

  test("path A (fr): three orders refused, the CEO angry then won over, December applauds", async ({ page }) => {
    await page.goto(LEVEL_PATH.fr);
    // One quarter at a time, the call of each checked as it opens.
    await expectCallMood(page, A.moods[0]);
    await expectSecretsAbsent(page);
    for (let q = 1; q <= 4; q++) {
      await hangUp(page);
      await expectOrder(page, A.orders[q - 1]!, "Demandé par le DG");
      await pickAndRun(page, A.path[q - 1]!);
      await expect(tileValue(page, "game-dash-churn")).toHaveText(A.churn[q - 1]!);
      await expect(tileValue(page, "game-dash-patience")).toHaveText(A.patience[q - 1]!);
      await expectSecretsAbsent(page);
      if (q === 1) {
        // P6 — what the first honest quarter did, said in the report.
        const report = page.getByTestId("game-report-1");
        await expect(report).toContainText("Trimestre 1 · janvier à mars");
        // Model v2: the survey's boost only starts next quarter, so −4 % (v1 printed −5 %).
        await expect(report).toContainText("Offre de pause : −4 % de résiliations ce trimestre, l'effet monte encore");
        await expect(report).toContainText("« Ce n'est pas ce qu'on avait dit. »");
      }
      if (q < 4) {
        await pickUpCall(page);
        await expectCallMood(page, A.moods[q]!);
        await expectSecretsAbsent(page);
      }
    }

    await openDecember(page);
    const ending = page.getByTestId("game-ending");
    await expect(ending).toHaveAttribute("data-win", "true");
    await expect(ending).toContainText("Décembre · applaudissements");
    await expect(ending).toContainText("Tu as tenu. Et ça a marché.");
    await expect(page.getByTestId("game-reveal-trust")).toContainText("83 / 100");
    await expect(page.getByTestId("game-reveal-radar")).toContainText("0 / 100");
    // The dashboard unblurs with December (P7).
    await expect(page.getByTestId("game-dash-trust")).toHaveAttribute("data-state", "known");
    await expect(tileValue(page, "game-dash-trust")).toHaveText("83");
    const playbook = page.getByTestId("game-playbook");
    await expect(playbook).toContainText("Le playbook qui a marché");
    await expect(playbook).toContainText("Offre de pause · confiance +4, radar −2");
    await expect(playbook).toContainText("Ordres du DG refusés : 3 sur 3.");
    // Two curves, each an image with its own name (a sentence, not a picture).
    for (const id of ["game-chart-churn", "game-chart-trust"]) {
      const curve = page.getByTestId(id).getByRole("img");
      await expect(curve).toHaveCount(1);
      await expect(curve).toHaveAttribute("aria-label", /\S/);
    }
    // An honest year used no trick: the catalogue has no « used » group at all.
    await expect(page.getByTestId("game-catalogue").locator("[data-group='used']")).toHaveCount(0);
    await expect(page.getByTestId("game-call")).toHaveAttribute("data-mood", "firm");

    const events = await trackedEvents(page);
    expect(events.filter((e) => e === "game_order/refused")).toHaveLength(3);
    expect(events).not.toContain("game_order/obeyed");
  });

  test("path C (en): the CEO obeyed twice, the DGCCRF in Q3, December reveals the tricks", async ({ page }) => {
    await page.goto(LEVEL_PATH.en);
    await expectCallMood(page, C.moods[0]);
    for (let q = 1; q <= 4; q++) {
      await hangUp(page);
      await expectOrder(page, C.orders[q - 1]!, "Requested by the CEO");
      await pickAndRun(page, C.path[q - 1]!);
      await expect(tileValue(page, "game-dash-churn")).toHaveText(C.churn[q - 1]!);
      await expect(tileValue(page, "game-dash-patience")).toHaveText(C.patience[q - 1]!);
      await expectSecretsAbsent(page);
      if (q === 3) {
        // P8 — the inspection lands in the third quarter, never before.
        await expect(page.getByTestId("game-report-3")).toContainText("An inspection by the DGCCRF");
      }
      if (q < 3) await expect(page.getByTestId(`game-report-${q}`)).not.toContainText("An inspection");
      if (q < 4) {
        await pickUpCall(page);
        await expectCallMood(page, C.moods[q]!);
        await expectSecretsAbsent(page);
      }
    }
    // After the inspection, the CEO asks for neither `call` nor `bury` (P8) —
    // the fixture's last order is `pdef`, pinned above.

    await openDecember(page);
    const ending = page.getByTestId("game-ending");
    await expect(ending).toHaveAttribute("data-win", "false");
    await expect(ending).toContainText("Here is what you did.");
    await expect(page.getByTestId("game-playbook")).toContainText("CEO orders refused: 1 out of 3.");
    // The six tricks played are in « used », unfolded, each removed by the inspection.
    const used = page.getByTestId("game-catalogue").locator("[data-group='used']");
    for (const id of ["pdef", "bury", "call", "cascade", "social", "notice"]) {
      const entry = used.getByTestId(`game-pattern-${id}`);
      await expect(entry).toBeVisible();
      await expect(entry).toContainText("removed");
      await expect(entry.getByText("Hidden effect")).toBeVisible();
    }
    await expect(used.locator("[data-testid^='game-pattern-']")).toHaveCount(6);

    const events = await trackedEvents(page);
    expect(events.filter((e) => e === "game_order/obeyed")).toHaveLength(2);
    expect(events.filter((e) => e === "game_order/refused")).toHaveLength(1);
  });
});

test.describe("coming back mid-quarter", () => {
  test("a reload in the hand, a quarter already played, asks — and restores the ticked card", async ({ page }) => {
    await page.goto(LEVEL_PATH.fr);
    await playQuarter(page, PATH_A[0]!);
    await pickUpCall(page);
    await hangUp(page);
    await page.getByTestId(`game-card-${PATH_A[1]![0]}`).click();

    await page.reload();
    await expect(page.getByTestId("game-resume")).toBeVisible();
    await acceptResume(page);
    await expect(page.getByTestId("game-desk")).toHaveAttribute("data-phase", "hand");
    await expect(page.getByTestId(`game-card-${PATH_A[1]![0]}`)).toHaveAttribute("aria-pressed", "true");
    await expect(page.getByTestId("game-journal-1")).toBeVisible();
    // Resuming lands on the hand, so the focus goes to its title (plan §3.5).
    await expect(page.locator("#game-hand-title")).toBeFocused();
    expect(await trackedEvents(page)).toEqual(["game_resume/resume"]);
  });

  test("a reload in the first quarter's hand resumes without asking: there was nothing to lose", async ({ page }) => {
    await page.goto(LEVEL_PATH.en);
    await hangUp(page);
    await page.getByTestId("game-card-pause").click();
    await page.reload();
    await expect(page.getByTestId("game-desk")).toHaveAttribute("data-phase", "hand");
    await expect(page.getByTestId("game-resume")).toHaveCount(0);
    await expect(page.getByTestId("game-card-pause")).toHaveAttribute("aria-pressed", "true");
  });

  test("« Recommencer » empties the device and the dashboard is January's again", async ({ page }) => {
    await seedGame(page, playPath(PATH_C)[2]!);
    // Behind « Reprendre ? » the desk shows the SAVED year, read-only: the
    // numbers behind a resume question are the ones it offers to resume
    // (C.churn[1], the second report of path C, written the French way).
    await expect(page.getByTestId("game-resume")).toBeVisible();
    await expect(tileValue(page, "game-dash-churn")).toHaveText("5,0 %");
    await page.getByTestId("game-resume-restart").click();
    await expect(tileValue(page, "game-dash-churn")).toHaveText("6,0 %");
    await expect(page.getByTestId("game-call")).toHaveAttribute("data-state", "open");
    await expect(page.getByTestId("game-call")).toBeFocused();
    await expect.poll(() => page.evaluate((k) => window.localStorage.getItem(k), GAME_SAVE_KEYS.retention)).toBeNull();
    await expect(tileValue(page, "game-dash-patience")).toHaveText("55");
    expect(await trackedEvents(page)).toEqual(["game_resume/restart"]);
  });
});

test.describe("P18/X30 — a language switch mid-year", () => {
  test("on the second report: the same report in English, no prompt, not a new year", async ({ page }) => {
    await page.goto(LEVEL_PATH.fr);
    await playQuarter(page, PATH_A[0]!);
    await pickUpCall(page);
    await playQuarter(page, PATH_A[1]!);
    await expect(page.getByTestId("game-report-2")).toContainText("Trimestre 2");

    await page.getByRole("group", { name: "Langue" }).getByRole("link", { name: "EN" }).click();
    await page.waitForURL(/\/en\/game\/retention/);
    await expect(page.getByTestId("game-resume")).toHaveCount(0);
    await expect(page.getByTestId("game-desk")).toHaveAttribute("data-phase", "report");
    await expect(page.getByTestId("game-report-2")).toContainText("Quarter 2");
    await expect(page.getByTestId("game-journal-1")).toContainText("Quarter 1");
    await expect(tileValue(page, "game-dash-churn")).toHaveText("5.7%");
    await expect.poll(() => page.url()).not.toContain("resume=");
    // The new document counted nothing: a switch is not a new year, nor a resume.
    const events = await trackedEvents(page);
    expect(events.filter((e) => e.startsWith("game_started") || e.startsWith("game_resume"))).toEqual([]);
  });
});

test.describe("P13 — replay", () => {
  test("from December: a fresh year, the device emptied, back at the top, the call focused", async ({ page }) => {
    await seedGame(page, playPath(PATH_C).at(-1)!, LEVEL_PATH.en);
    await acceptResume(page);
    await expect(page.getByTestId("game-december")).toBeVisible();
    await page.getByTestId("game-replay").scrollIntoViewIfNeeded();
    expect(await page.evaluate(() => window.scrollY)).toBeGreaterThan(500);

    await page.getByTestId("game-replay").click();
    await expect(page.getByTestId("game-december")).toHaveCount(0);
    await expect(page.getByTestId("game-call")).toHaveAttribute("data-state", "open");
    await expect(page.getByTestId("game-journal")).toHaveCount(0);
    await expect(tileValue(page, "game-dash-churn")).toHaveText("6.0%");
    await expectSecretsAbsent(page);
    await expect.poll(() => page.evaluate(() => window.scrollY)).toBe(0);
    await expect(page.getByTestId("game-call")).toBeFocused();
    await expect.poll(() => page.evaluate((k) => window.localStorage.getItem(k), GAME_SAVE_KEYS.retention)).toBeNull();
    await expect.poll(() => trackedEvents(page)).toContain("game_replay");
  });
});

test.describe("reduced motion", () => {
  test("the months run at once: the desk never enters `running`", async ({ page }) => {
    await recordPhases(page);
    await page.goto(LEVEL_PATH.fr);
    await playQuarter(page, PATH_A[0]!);
    const phases = await recordedPhases(page);
    // The news screen is never skipped for reduced motion — only its animation is.
    expect(phases).toEqual(["hand", "news", "report"]);
    // Nothing left moving on the report (X29).
    expect(await page.evaluate(() => document.getAnimations().filter((a) => a.playState === "running").length)).toBe(0);
  });

  test.describe("with motion on", () => {
    test.use({ contextOptions: { reducedMotion: "no-preference" } });

    // The recorder's own non-vacuity: the same quarter, animated, is seen running.
    test("the same quarter scrolls through `running`", async ({ page }) => {
      await recordPhases(page);
      await page.goto(LEVEL_PATH.fr);
      await playQuarter(page, PATH_A[0]!);
      expect(await recordedPhases(page)).toEqual(["hand", "running", "news", "report"]);
    });
  });
});

test.describe("P17/X31 — a phone, 390 wide, at every phase", () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test("call, hand, report, ringing, the next call, December, the resume prompt: never a sideways scroll", async ({ page }) => {
    await page.goto(LEVEL_PATH.fr);
    const at = async (phase: string) => {
      await expect(page.getByTestId("game-desk")).toHaveAttribute("data-phase", phase);
      expect(await horizontalOverflow(page), `sideways scroll in ${phase}`).toBe(0);
    };
    await at("call");
    await hangUp(page);
    for (const card of PATH_C[0]!) await page.getByTestId(`game-card-${card}`).click();
    await expect(page.getByTestId("game-actionbar")).toBeVisible();
    await at("hand");
    await page.getByTestId("game-run").click();
    await at("news");
    await skipNews(page);
    await at("report");
    await page.getByTestId("game-report-next").click();
    await at("ringing");
    await page.getByTestId("game-pickup").click();
    await at("call");

    await seedGame(page, playPath(PATH_C).at(-1)!);
    await at("resumePrompt");
    await acceptResume(page);
    await at("december");
  });

  test.describe("with motion on", () => {
    test.use({ contextOptions: { reducedMotion: "no-preference" } });

    test("the months scrolling do not widen the page", async ({ page }) => {
      await page.goto(LEVEL_PATH.en);
      await hangUp(page);
      for (const card of PATH_A[0]!) await page.getByTestId(`game-card-${card}`).click();
      await page.getByTestId("game-run").click();
      await expect(page.getByTestId("game-desk")).toHaveAttribute("data-phase", "running");
      expect(await horizontalOverflow(page)).toBe(0);
      await expect(page.getByTestId("game-news")).toBeVisible({ timeout: 10_000 });
      expect(await horizontalOverflow(page)).toBe(0);
    });
  });
});

test.describe("arriving from a result", () => {
  test("the card on /r/sample leads to the level, which counts game_started/retention/result", async ({ page }) => {
    // This file runs with the game open (see the skip at the top), so the
    // card shows without any preview.
    await page.goto("/r/sample?lang=fr");
    const cta = page.getByTestId("game-entry-cta");
    await expect(cta).toHaveAttribute("href", "/fr/game/retention?from=result");
    await cta.click();
    await page.waitForURL(/\/fr\/game\/retention/);
    // A full document load (the other root layout): these are the level's own events.
    await expect.poll(() => trackedEvents(page)).toContain("game_started/retention/result");
    expect((await trackedEvents(page)).filter((e) => e.startsWith("game_started"))).toHaveLength(1);
    await expect.poll(() => page.url()).not.toContain("from=");
  });
});
