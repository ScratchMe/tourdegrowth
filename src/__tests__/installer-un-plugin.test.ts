import { spawnSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { ESLint } from "eslint";
import { afterAll, describe, expect, test } from "vitest";

/**
 * Guard of `scripts/installer-un-plugin.mjs`, run on real plug-ins built in a temporary directory,
 * against a fake repository that is just as temporary: the real one is never touched.
 *
 * What is exercised is each of the three rules in the script's header — the prefix with its
 * references and links, what is never installed, and "nothing is written before everything is
 * checked" — plus what lasts from one installation to the next: the update, which is the only way
 * to install the same plug-in twice without it being a collision, the prefix, the `--manuel` mode
 * and the licence supplied the first time, and `--retirer`, which undoes exactly what an
 * installation installed.
 *
 * Ported with the script from Ramille (ScratchMe/Ramille#261, commit aa06744), where it was proved
 * non-vacuous on 2026-09-24 by breaking the script forty-four times. The port changes the language
 * of the messages it asserts on, so that proof did not carry over by itself: it was replayed here.
 *
 * Non-vacuity, measured on 2026-09-27 by breaking the ported script eighteen times — at least once
 * per family below, each mutation applied as an exact snippet replacement (asserted to occur once)
 * and the script restored byte for byte before the next one. The tests that failed are in brackets,
 * and no other test failed in any of them:
 *   - the prefix: no longer rewrite the `name` field, 1 (the nominal one); double it on a name that
 *     already carries it, 2 (the prefix already carried, the short prefix);
 *   - references and links: no longer rewrite references, 2 (the references, the prefix already
 *     carried); no longer recompute links, 1 (the links); take any `plugin:` form for a reference — a
 *     Gradle coordinate is one —, 1 (the references);
 *   - what is not installed: accept hooks in a front matter, 2 (the skill, the command); name `AGENT`
 *     an agent kept in its own directory, 1 (the hooks);
 *   - before writing: look for collisions while writing instead of before, 1 (the collision, through
 *     the skill written before the refusal); accept a symbolic link, 1; extract without first reading
 *     the list of entries, 1 (the evasion);
 *   - from one installation to the next: forget the last installation's mode, 1 (manual mode); no
 *     longer remove what the previous version installed, 1 (the update);
 *   - the licence: forget the supplied licence on update, 1 (the licence taken back); no longer report
 *     a plug-in without one, 1 (the plug-in without a licence);
 *   - the report: list every data file as a script to read, 1 (the data);
 *   - removal: remove everything carrying the prefix instead of the list, 1 (the nominal removal); no
 *     longer revalidate the names read back from `installation.json`, validate them while removing
 *     rather than before, 1 each (the trapped name).
 * Plus, for the block that belongs to this repository only: drop `.claude` from the tsconfig's
 * `exclude`, drop `.claude/**` from ESLint's ignores, 1 each (their own test).
 * No mutation survived.
 */

const ROOT = process.cwd();
const SCRIPT = path.join(ROOT, "scripts", "installer-un-plugin.mjs");

const temporaries: string[] = [];
const temporary = (prefix: string) => {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), prefix));
  temporaries.push(directory);
  return directory;
};
afterAll(() => temporaries.forEach((directory) => fs.rmSync(directory, { recursive: true, force: true })));

/** A built plug-in: each key is a path relative to its root, each value its contents. */
function plugin(files: Record<string, string>): string {
  const root = temporary("tdg-plugin-");
  for (const [relative, contents] of Object.entries(files)) {
    const file = path.join(root, relative);
    fs.mkdirSync(path.dirname(file), { recursive: true });
    fs.writeFileSync(file, contents);
  }
  return root;
}

const manifest = (version = "1.0.0") => JSON.stringify({ name: "tool", version });
const skill = (name: string, extraFrontMatter = "") =>
  `---\nname: ${name}\ndescription: The ${name} skill.\n${extraFrontMatter}---\n\nInstructions for ${name}.\n`;

function run(...args: string[]) {
  const r = spawnSync(process.execPath, [SCRIPT, ...args], { encoding: "utf8" });
  return { code: r.status, output: `${r.stdout}${r.stderr}` };
}
const install = (source: string, repo: string, ...options: string[]) => run(source, "--racine", repo, ...options);
const remove = (name: string, repo: string, ...options: string[]) => run("--retirer", name, "--racine", repo, ...options);

const read = (repo: string, relative: string) => fs.readFileSync(path.join(repo, relative), "utf8");
const exists = (repo: string, relative: string) => fs.existsSync(path.join(repo, relative));
const installation = (repo: string) => JSON.parse(read(repo, ".claude/plugins-importes/tool/installation.json"));

describe("installing a plug-in", () => {
  test("installs skills and commands under the plug-in's name, directory and front matter included", () => {
    const repo = temporary("tdg-repo-");
    const r = install(
      plugin({
        ".claude-plugin/plugin.json": manifest("1.2.0"),
        "skills/write/SKILL.md": skill("write"),
        "skills/write/references/guide.md": "A guide.\n",
        "commands/idea.md": "---\ndescription: An idea.\n---\nFind an idea.\n",
        LICENSE: "Licence.\n",
        "README.md": "Read me.\n",
      }),
      repo,
    );

    expect(r.code).toBe(0);
    const instructions = read(repo, ".claude/skills/tool-write/SKILL.md");
    expect(instructions).toMatch(/^---\nname: tool-write\ndescription: The write skill\.\n---\n/);
    expect(instructions).toContain("Modified for Tour de Growth");
    expect(read(repo, ".claude/skills/tool-write/references/guide.md")).toBe("A guide.\n");
    expect(exists(repo, ".claude/skills/write")).toBe(false);
    expect(read(repo, ".claude/commands/tool-idea.md")).toContain("Find an idea.");
    expect(installation(repo)).toMatchObject({
      plugin: "tool",
      version: "1.2.0",
      sha256: null,
      skills: [{ amont: "write", installe: "tool-write" }],
      commandes: [{ amont: "idea", installe: "tool-idea" }],
    });
    // The licence travels with the plug-in; the upstream README does not, it quotes the pre-prefix names.
    expect(read(repo, ".claude/plugins-importes/tool/LICENSE")).toBe("Licence.\n");
    expect(exists(repo, ".claude/plugins-importes/tool/README.md")).toBe(false);
  });

  test("rewrites references to upstream names, and leaves paths as they are while reporting them", () => {
    const repo = temporary("tdg-repo-");
    const r = install(
      plugin({
        ".claude-plugin/plugin.json": manifest(),
        "skills/write/SKILL.md": skill("write"),
        "commands/idea.md":
          "---\ndescription: An idea.\n---\n# /idea\n\nThen → `/write`, or tool:write.\n" +
          "See skills/write/SKILL.md, and /write-bis which is not ours.\n" +
          // A Gradle-style coordinate, where the plug-in's name precedes ":" without designating a skill.
          "The library `com.tool:tool:1.0`.\n" +
          // Prose: the upstream name glued to a word is neither a reference nor a path.
          "You can read/write at will.\n",
      }),
      repo,
    );

    expect(r.code).toBe(0);
    const command = read(repo, ".claude/commands/tool-idea.md");
    expect(command).toContain("# /tool-idea\n");
    expect(command).toContain("Then → `/tool-write`, or tool-write.\n");
    expect(command).toContain("See skills/write/SKILL.md, and /write-bis which is not ours.\n");
    expect(command).toContain("You can read/write at will.\n");
    expect(command).toContain("Modified for Tour de Growth");
    expect(r.output).toMatch(/tool-idea\.md:7 \(upstream name left as is\)/);
    expect(r.output).not.toContain("tool-idea.md:8");
    expect(r.output).not.toContain("tool-idea.md:9");
  });

  test("recomputes relative links for the files' new place, and reports the dead ones", () => {
    const repo = temporary("tdg-repo-");
    const r = install(
      plugin({
        ".claude-plugin/plugin.json": manifest(),
        "CONNECTORS.md": "# Connectors\n",
        "skills/write/SKILL.md":
          skill("write") +
          "See [the connectors](../../CONNECTORS.md#categories), [read](../read/SKILL.md), " +
          "[the guide](references/guide.md), [the site](https://example.invalid/x), [the hooks](../../hooks/hooks.json) " +
          "and [the missing one](../read/ABSENT.md).\n",
        "skills/write/references/guide.md": "A guide.\n",
        "skills/read/SKILL.md": skill("read"),
        "commands/idea.md": "---\ndescription: An idea.\n---\nSee [the connectors](../CONNECTORS.md).\n",
        "hooks/hooks.json": "{}",
      }),
      repo,
    );

    expect(r.code).toBe(0);
    const instructions = read(repo, ".claude/skills/tool-write/SKILL.md");
    expect(instructions).toContain("[the connectors](../../plugins-importes/tool/CONNECTORS.md#categories)");
    expect(instructions).toContain("[read](../tool-read/SKILL.md)");
    expect(instructions).toContain("[the guide](references/guide.md)");
    expect(instructions).toContain("[the site](https://example.invalid/x)");
    expect(instructions).toContain("[the hooks](../../hooks/hooks.json)");
    // A file missing upstream is not "recomputed": rewritten, it would look alive.
    expect(instructions).toContain("[the missing one](../read/ABSENT.md)");
    expect(read(repo, ".claude/commands/tool-idea.md")).toContain("[the connectors](../plugins-importes/tool/CONNECTORS.md)");
    // A recomputed link is only worth something if it leads somewhere: each is resolved from its new place.
    for (const [from, link] of [
      [".claude/skills/tool-write", "../../plugins-importes/tool/CONNECTORS.md"],
      [".claude/skills/tool-write", "../tool-read/SKILL.md"],
      [".claude/skills/tool-write", "references/guide.md"],
      [".claude/commands", "../plugins-importes/tool/CONNECTORS.md"],
    ] as const) {
      expect(exists(repo, path.join(from, link))).toBe(true);
    }
    expect(r.output).toContain("(link to a file that is not installed) — ../../hooks/hooks.json");
    expect(r.output).toContain("(link to a file that is not installed) — ../read/ABSENT.md");
  });

  test("never installs a hook, a connector or an agent — and says so", () => {
    const repo = temporary("tdg-repo-");
    const r = install(
      plugin({
        ".claude-plugin/plugin.json": manifest(),
        "skills/write/SKILL.md": skill("write"),
        "hooks/hooks.json": '{"hooks":{}}',
        ".mcp.json": JSON.stringify({ mcpServers: { slack: {}, linear: {} } }),
        "agents/reviewer.md": "---\nname: reviewer\n---\n",
        // The second shape of an agent: a directory named after it, with `AGENT.md` inside.
        "agents/auditor/AGENT.md": "---\nname: auditor\n---\n",
        // What an upstream repository and the other agents put at the root: neither installed nor reported.
        ".github/workflows/ci.yml": "on: push\n",
        "CONTRIBUTING.md": "Contribute.\n",
        ".cursor-plugin/plugin.json": "{}",
      }),
      repo,
    );

    expect(r.code).toBe(0);
    for (const entry of [".claude/settings.json", ".claude/hooks", ".claude/agents", ".mcp.json"]) {
      expect(exists(repo, entry)).toBe(false);
    }
    expect(installation(repo).non_installe).toEqual({
      hooks: ["hooks/hooks.json"],
      connecteurs: ["linear", "slack"],
      agents: ["auditor", "reviewer"],
      autres: [],
    });
    expect(r.output).toContain("linear, slack");
    expect(r.output).toContain("auditor, reviewer");
  });

  test("does not double a prefix already carried, and does not take the added notice for a reference", () => {
    const repo = temporary("tdg-repo-");
    const r = install(
      plugin({
        ".claude-plugin/plugin.json": manifest(),
        // A skill named after the plug-in, which points at a command: it is modified, so marked — and
        // the notice names `.claude/plugins-importes/tool/`, where "/tool" can be read.
        "skills/tool/SKILL.md": skill("tool") + "Then, /idea.\n",
        "skills/tool-read/SKILL.md": skill("tool-read"),
        "commands/idea.md": "A command without front matter: its name is the file's.\n",
      }),
      repo,
    );

    expect(r.code).toBe(0);
    expect(exists(repo, ".claude/skills/tool/SKILL.md")).toBe(true);
    expect(exists(repo, ".claude/skills/tool-read/SKILL.md")).toBe(true);
    expect(exists(repo, ".claude/skills/tool-tool-read")).toBe(false);
    expect(read(repo, ".claude/skills/tool/SKILL.md")).toContain("Then, /tool-idea.");
    expect(r.output).not.toContain("upstream name left as is");
  });

  test("takes a shorter prefix, and an update takes it back without being told again", () => {
    const repo = temporary("tdg-repo-");
    const source = () =>
      plugin({
        ".claude-plugin/plugin.json": JSON.stringify({ name: "tool-with-a-name-far-too-long", version: "1.0.0" }),
        "skills/short-write/SKILL.md": skill("short-write"),
        "skills/read/SKILL.md": skill("read"),
        // A skill named after the plug-in, renamed by the prefix: the notice added to it names
        // `.claude/plugins-importes/tool-with-a-name-far-too-long/`, where its upstream name can be read.
        "skills/tool-with-a-name-far-too-long/SKILL.md": skill("tool-with-a-name-far-too-long"),
      });

    expect(install(source(), repo, "--prefixe", "short").code).toBe(0);
    const r = install(source(), repo);

    expect(r.code).toBe(0);
    expect(exists(repo, ".claude/skills/short-write/SKILL.md")).toBe(true);
    expect(exists(repo, ".claude/skills/short-read/SKILL.md")).toBe(true);
    expect(exists(repo, ".claude/skills/short-tool-with-a-name-far-too-long/SKILL.md")).toBe(true);
    expect(exists(repo, ".claude/skills/tool-with-a-name-far-too-long-read")).toBe(false);
    expect(r.output).not.toContain("upstream name left as is");
    // The provenance stays filed under the plug-in's name, not under the prefix.
    const record = JSON.parse(read(repo, ".claude/plugins-importes/tool-with-a-name-far-too-long/installation.json"));
    expect(record).toMatchObject({ plugin: "tool-with-a-name-far-too-long", prefixe: "short" });
  });

  test("reads the skills a manifest keeps elsewhere, and refuses a path that leaves the plug-in", () => {
    const repo = temporary("tdg-repo-");
    const r = install(
      plugin({
        ".claude-plugin/plugin.json": JSON.stringify({ name: "tool", skills: "./.claude/skills/" }),
        ".claude/skills/write/SKILL.md": skill("write"),
      }),
      repo,
    );
    expect(r.code).toBe(0);
    expect(exists(repo, ".claude/skills/tool-write/SKILL.md")).toBe(true);
    expect(installation(repo).non_installe.autres).toEqual([]);

    const outside = install(
      plugin({
        ".claude-plugin/plugin.json": JSON.stringify({ name: "tool", skills: "../elsewhere" }),
        "skills/write/SKILL.md": skill("write"),
      }),
      temporary("tdg-repo-"),
    );
    expect(outside.code).toBe(1);
    expect(outside.output).toContain("leaves the plug-in");
  });

  test("in --manuel, nothing triggers on its own, and an update keeps that mode", () => {
    const repo = temporary("tdg-repo-");
    const source = () =>
      plugin({
        ".claude-plugin/plugin.json": manifest(),
        "skills/write/SKILL.md": skill("write"),
        // Reserved for the agent upstream: in manual mode, nobody could call it any more.
        "skills/background/SKILL.md": skill("background", "user-invocable: false\n"),
        "commands/idea.md": "---\ndescription: An idea.\n---\nFind an idea.\n",
      });

    expect(install(source(), repo, "--manuel").code).toBe(0);
    const r = install(source(), repo);
    expect(r.code).toBe(0);

    expect(read(repo, ".claude/skills/tool-write/SKILL.md")).toMatch(/\ndisable-model-invocation: true\n---\n/);
    expect(read(repo, ".claude/commands/tool-idea.md")).toMatch(/\ndisable-model-invocation: true\n---\n/);
    expect(read(repo, ".claude/skills/tool-background/SKILL.md")).toMatch(/\nuser-invocable: true\n/);
    expect(read(repo, ".claude/skills/tool-write/SKILL.md")).not.toMatch(/^user-invocable:/m);
    expect(r.output).toContain("made callable by their name: /tool-background.");
    expect(installation(repo).manuel).toBe(true);

    expect(install(source(), repo, "--auto").code).toBe(0);
    expect(read(repo, ".claude/skills/tool-write/SKILL.md")).not.toContain("disable-model-invocation");
    expect(read(repo, ".claude/skills/tool-background/SKILL.md")).toMatch(/\nuser-invocable: false\n/);
    expect(installation(repo).manuel).toBe(false);
  });

  test("attaches the supplied licence when the archive carries none, and takes it back on every update", () => {
    const repo = temporary("tdg-repo-");
    const text = path.join(temporary("tdg-license-"), "LICENSE");
    fs.writeFileSync(text, "Apache License, Version 2.0\n");
    const source = () => plugin({ ".claude-plugin/plugin.json": manifest(), "skills/write/SKILL.md": skill("write") });

    const r = install(source(), repo, "--licence", text);
    expect(r.code).toBe(0);
    expect(r.output).toContain("Licence: supplied at installation");
    expect(installation(repo).licence_fournie).toEqual({ fichier: "LICENSE", sha256: expect.stringMatching(/^[0-9a-f]{64}$/) });

    // The update erases the provenance before putting it back: without taking it back, the licence would go.
    expect(install(source(), repo).code).toBe(0);
    expect(read(repo, ".claude/plugins-importes/tool/LICENSE")).toBe("Apache License, Version 2.0\n");
    expect(installation(repo).licence_fournie).toBeDefined();
  });

  test("reports a plug-in without a licence, and refuses to add one to an archive that has its own", () => {
    const without = install(
      plugin({ ".claude-plugin/plugin.json": manifest(), "skills/write/SKILL.md": skill("write") }),
      temporary("tdg-repo-"),
    );
    expect(without.code).toBe(0);
    expect(without.output).toContain("No licence: the archive carries none");

    const text = path.join(temporary("tdg-license-"), "LICENSE");
    fs.writeFileSync(text, "Another licence.\n");
    const repo = temporary("tdg-repo-");
    const withOwn = install(
      plugin({ ".claude-plugin/plugin.json": manifest(), "skills/write/SKILL.md": skill("write"), LICENSE: "Its own.\n" }),
      repo,
      "--licence",
      text,
    );
    expect(withOwn.code).toBe(1);
    expect(withOwn.output).toContain("the archive already carries its licence");
    expect(exists(repo, ".claude")).toBe(false);
  });

  test("lists the scripts to read one by one, and counts the data", () => {
    const repo = temporary("tdg-repo-");
    const r = install(
      plugin({
        ".claude-plugin/plugin.json": manifest(),
        "skills/write/SKILL.md": skill("write"),
        "skills/write/scripts/search.py": 'print("search")\n',
        "skills/write/data/styles.csv": "name\n",
        "skills/write/data/colours.csv": "name\n",
        "skills/write/fonts/sans.ttf": "font",
      }),
      repo,
    );

    expect(r.code).toBe(0);
    expect(r.output).toContain(".claude/skills/tool-write/scripts/search.py — script or binary: read what it does");
    expect(r.output).toContain("data, copied as is: 2 × .csv, 1 × .ttf");
    expect(r.output).not.toContain("styles.csv");
  });

  test.each<[string, Record<string, string>]>([
    ["a skill", { "skills/write/SKILL.md": skill("write", "hooks:\n  Stop:\n    - command: echo\n") }],
    ["a command", { "skills/write/SKILL.md": skill("write"), "commands/idea.md": "---\nhooks: {}\n---\n" }],
  ])("refuses %s that declares hooks in its front matter", (_, files) => {
    const repo = temporary("tdg-repo-");
    const r = install(plugin({ ".claude-plugin/plugin.json": manifest(), ...files }), repo);

    expect(r.code).toBe(1);
    expect(r.output).toContain("declares hooks");
    expect(exists(repo, ".claude")).toBe(false);
  });

  test("refuses a collision, and then writes nothing at all", () => {
    // The collision is on the SECOND skill in write order (`tool-read` is written before `tool-write`):
    // a script that checked as it went would already have installed the first, and that is what we
    // want to see fail.
    const repo = temporary("tdg-repo-");
    fs.mkdirSync(path.join(repo, ".claude/skills/tool-write"), { recursive: true });
    fs.writeFileSync(path.join(repo, ".claude/skills/tool-write/SKILL.md"), "ours\n");

    const r = install(
      plugin({
        ".claude-plugin/plugin.json": manifest(),
        "skills/write/SKILL.md": skill("write"),
        "skills/read/SKILL.md": skill("read"),
      }),
      repo,
    );

    expect(r.code).toBe(1);
    expect(r.output).toContain(".claude/skills/tool-write");
    expect(read(repo, ".claude/skills/tool-write/SKILL.md")).toBe("ours\n");
    expect(exists(repo, ".claude/skills/tool-read")).toBe(false);
    expect(exists(repo, ".claude/plugins-importes")).toBe(false);
  });

  test("an update replaces what the previous version installed, and removes what disappeared", () => {
    const repo = temporary("tdg-repo-");
    install(
      plugin({
        ".claude-plugin/plugin.json": manifest("1.0.0"),
        "skills/write/SKILL.md": skill("write"),
        "skills/read/SKILL.md": skill("read"),
      }),
      repo,
    );

    const r = install(
      plugin({
        ".claude-plugin/plugin.json": manifest("2.0.0"),
        "skills/write/SKILL.md": skill("write", 'argument-hint: "<subject>"\n'),
        "skills/count/SKILL.md": skill("count"),
      }),
      repo,
    );

    expect(r.code).toBe(0);
    expect(r.output).toContain("Replaces version 1.0.0");
    expect(exists(repo, ".claude/skills/tool-read")).toBe(false);
    expect(exists(repo, ".claude/skills/tool-count/SKILL.md")).toBe(true);
    expect(read(repo, ".claude/skills/tool-write/SKILL.md")).toContain("argument-hint");
    expect(installation(repo).version).toBe("2.0.0");
  });

  test("refuses a symbolic link, which could point at any file of the machine", () => {
    const repo = temporary("tdg-repo-");
    const source = plugin({ ".claude-plugin/plugin.json": manifest(), "skills/write/SKILL.md": skill("write") });
    fs.symlinkSync(os.homedir(), path.join(source, "skills/write/home"));

    const r = install(source, repo);

    expect(r.code).toBe(1);
    expect(r.output).toContain("symbolic link");
    expect(exists(repo, ".claude")).toBe(false);
  });

  test("reads a .zip archive wrapped in a directory, and keeps its fingerprint", () => {
    const source = plugin({
      "tool/.claude-plugin/plugin.json": manifest(),
      "tool/skills/write/SKILL.md": skill("write"),
    });
    const archive = path.join(temporary("tdg-zip-"), "tool.zip");
    // Without `zip`, this test fails instead of being skipped: a skipped test reads as "green".
    expect(spawnSync("zip", ["-qr", archive, "."], { cwd: source }).status).toBe(0);
    const repo = temporary("tdg-repo-");

    const r = install(archive, repo);

    expect(r.code).toBe(0);
    expect(exists(repo, ".claude/skills/tool-write/SKILL.md")).toBe(true);
    expect(installation(repo)).toMatchObject({ source: "tool.zip", sha256: expect.stringMatching(/^[0-9a-f]{64}$/) });
  });

  test("refuses an archive that would try to write outside its directory", () => {
    // `unzip` would place the entry INSIDE the directory without a word (measured, see the script):
    // that is exactly what this checks, that the refusal does not depend on that behaviour.
    const archive = path.join(temporary("tdg-zip-"), "evasion.zip");
    const build = [
      "import sys, zipfile",
      "with zipfile.ZipFile(sys.argv[1], 'w') as z:",
      '    z.writestr(".claude-plugin/plugin.json", \'{"name": "tool"}\')',
      '    z.writestr("skills/write/SKILL.md", "---\\nname: write\\n---\\n")',
      '    z.writestr("../evasion.md", "outside the directory")',
    ].join("\n");
    // Python writes the name exactly as given. Without it, this test fails instead of being skipped.
    expect(spawnSync("python3", ["-c", build, archive]).status).toBe(0);
    const repo = temporary("tdg-repo-");

    const r = install(archive, repo);

    expect(r.code).toBe(1);
    expect(r.output).toContain("outside its directory: ../evasion.md");
    expect(exists(repo, ".claude")).toBe(false);
  });

  test.each<[string, Record<string, string>, string]>([
    ["what is not a plug-in", { "skills/write/SKILL.md": skill("write") }, "this is not a plug-in"],
    [
      "an invalid plug-in name",
      { ".claude-plugin/plugin.json": JSON.stringify({ name: "Tool Uppercase" }), "skills/write/SKILL.md": skill("write") },
      "not a valid plug-in name",
    ],
    [
      "a plug-in with nothing installable",
      { ".claude-plugin/plugin.json": manifest(), "hooks/hooks.json": "{}" },
      "neither skill nor command",
    ],
    [
      "a skill and a command that would carry the same name",
      { ".claude-plugin/plugin.json": manifest(), "skills/idea/SKILL.md": skill("idea"), "commands/idea.md": "---\n---\n" },
      "would carry the same name",
    ],
    [
      "a skill without front matter",
      { ".claude-plugin/plugin.json": manifest(), "skills/write/SKILL.md": "No front matter.\n" },
      "has no front matter",
    ],
  ])("refuses %s, writing nothing", (_, files, pattern) => {
    const repo = temporary("tdg-repo-");
    const r = install(plugin(files), repo);

    expect(r.code).toBe(1);
    expect(r.output).toContain(pattern);
    expect(exists(repo, ".claude")).toBe(false);
  });
});

describe("removing a plug-in", () => {
  const source = () =>
    plugin({
      ".claude-plugin/plugin.json": manifest(),
      "skills/write/SKILL.md": skill("write"),
      "skills/read/SKILL.md": skill("read"),
      "commands/idea.md": "---\ndescription: An idea.\n---\nFind an idea.\n",
      LICENSE: "Licence.\n",
    });

  test("removes what the installation installed, and nothing that looks like it", () => {
    const repo = temporary("tdg-repo-");
    expect(install(source(), repo).code).toBe(0);
    // Written here under the plug-in's prefix: only `installation.json` tells them apart from its own.
    fs.mkdirSync(path.join(repo, ".claude/skills/tool-home"));
    fs.writeFileSync(path.join(repo, ".claude/skills/tool-home/SKILL.md"), "ours\n");
    fs.writeFileSync(path.join(repo, ".claude/commands/tool-home.md"), "ours\n");

    const r = remove("tool", repo);

    expect(r.code).toBe(0);
    for (const entry of [
      ".claude/skills/tool-write",
      ".claude/skills/tool-read",
      ".claude/commands/tool-idea.md",
      ".claude/plugins-importes/tool",
    ]) {
      expect(exists(repo, entry)).toBe(false);
    }
    expect(read(repo, ".claude/skills/tool-home/SKILL.md")).toBe("ours\n");
    expect(read(repo, ".claude/commands/tool-home.md")).toBe("ours\n");
    expect(r.output).toContain("Plug-in tool 1.0.0 removed — 2 skill(s), 1 command(s), and its provenance.");
  });

  test.each<[string, string, string[]]>([
    ["a plug-in that is not installed", "other", ['no plug-in "other"', "Installed: tool."]],
    ["a name that is not one", "../tool", ["not a valid plug-in name"]],
  ])("refuses %s, touching nothing", (_, name, patterns) => {
    const repo = temporary("tdg-repo-");
    expect(install(source(), repo).code).toBe(0);

    const r = remove(name, repo);

    expect(r.code).toBe(1);
    for (const pattern of patterns) expect(r.output).toContain(pattern);
    expect(exists(repo, ".claude/skills/tool-write/SKILL.md")).toBe(true);
  });

  test("refuses an installation.json that would designate something other than a skill, on removal as on update", () => {
    const repo = temporary("tdg-repo-");
    expect(install(source(), repo).code).toBe(0);
    fs.mkdirSync(path.join(repo, "src"));
    fs.writeFileSync(path.join(repo, "src/keep.ts"), "to keep\n");
    // The trapped name comes AFTER two valid names: a removal that validated as it went would already
    // have erased the first ones, and that is what we want to see fail.
    const record = installation(repo);
    record.skills.push({ amont: "trap", installe: "../../src" });
    fs.writeFileSync(path.join(repo, ".claude/plugins-importes/tool/installation.json"), JSON.stringify(record));

    for (const r of [remove("tool", repo), install(source(), repo)]) {
      expect(r.code).toBe(1);
      expect(r.output).toContain('carries a name that is not one: "../../src"');
    }
    expect(read(repo, "src/keep.ts")).toBe("to keep\n");
    expect(exists(repo, ".claude/skills/tool-write/SKILL.md")).toBe(true);
  });

  test("refuses --retirer next to an archive, a mode or a licence: one of the two commands erases", () => {
    const repo = temporary("tdg-repo-");
    expect(install(source(), repo).code).toBe(0);
    const text = path.join(temporary("tdg-license-"), "LICENSE");
    fs.writeFileSync(text, "Licence.\n");

    for (const r of [
      install(source(), repo, "--retirer", "tool"),
      remove("tool", repo, "--manuel"),
      remove("tool", repo, "--licence", text),
    ]) {
      expect(r.code).toBe(1);
      expect(r.output).toContain("--retirer takes only the plug-in's name");
    }
    expect(exists(repo, ".claude/skills/tool-write/SKILL.md")).toBe(true);
  });
});

describe("the repository's own tools leave installed plug-ins alone", () => {
  // A plug-in can carry scripts (`.py`, `.js`, `.ts`) that nobody here wrote nor maintains: linting
  // or type-checking them would fail CI on someone else's code, and they are read before committing
  // (the script's output lists them), not held to this repository's rules.
  const installedFiles = [".claude/skills/tool-write/scripts/search.ts", ".claude/skills/tool-write/scripts/search.js"];

  test("ESLint ignores what is installed under .claude/", async () => {
    const eslint = new ESLint({ cwd: ROOT });
    for (const file of installedFiles) expect(await eslint.isPathIgnored(path.join(ROOT, file))).toBe(true);
    // Non-vacuity: the same check on a script of this repository must say "linted".
    expect(await eslint.isPathIgnored(SCRIPT)).toBe(false);
    // Loading eslint-config-next (typescript-eslint, the React plugins) takes seconds on its own.
  }, 60_000);

  test("the type-check excludes .claude/", () => {
    const tsconfig = JSON.parse(read(ROOT, "tsconfig.json")) as { exclude?: string[] };
    expect(tsconfig.exclude).toContain(".claude");
  });
});
