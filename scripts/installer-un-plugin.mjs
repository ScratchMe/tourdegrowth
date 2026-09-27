#!/usr/bin/env node
/**
 * installer-un-plugin.mjs — Tour de Growth
 *
 * Installs a Claude Code plug-in into the repository, from its `.zip` archive or its directory.
 *
 *   node scripts/installer-un-plugin.mjs <archive.zip | dossier> [--prefixe <court>] [--manuel | --auto]
 *                                        [--licence <fichier>] [--racine <dépôt>]
 *   node scripts/installer-un-plugin.mjs --retirer <plug-in> [--racine <dépôt>]
 *
 * Ported from Ramille (ScratchMe/Ramille#261, commit aa06744, 2026-09-24), where it was built and
 * measured. The command line, the `.claude/plugins-importes/` directory and the keys of
 * `installation.json` are kept exactly as they are there, so that one mechanism reads the same in
 * both repositories and a provenance directory means the same thing in either. Everything else —
 * comments, messages, names inside the code — follows this repository's convention: English for
 * code, French for CLAUDE.md.
 *
 * **Why by hand: claude.ai does not deliver plug-ins to cloud sessions.** Observed on 2026-09-24 in
 * Ramille: Product Management was enabled on the account and the session could not see it — the
 * account's plug-in list empty, the catalogue "not enabled", the sync directory empty. The
 * repository is the one thing a cloud session is sure to carry, so that is where plug-ins live, and
 * CLAUDE.md says how they are used.
 *
 * Running the script again on a newer archive of the same plug-in updates it: what it had installed
 * is removed first, so a skill that disappeared upstream disappears here too. The prefix and the
 * mode chosen the first time are kept in `installation.json`: an update takes them back.
 *
 * **`--retirer <plug-in>` undoes an installation**: exactly what its `installation.json` says it
 * installed, then its provenance — never everything that starts with the prefix, which would take a
 * skill written here under a neighbouring name with it. Whatever mentions the plug-in elsewhere in
 * the repository (CLAUDE.md, a document) is left to reread by hand, and the script says so.
 *
 * **`--manuel` installs a useful but talkative plug-in.** Every installed skill loads its description
 * into the context of EVERY session and can trigger on its own on a nearby subject — Auth0 ships
 * forty-five, for a provider Ramille does not use. In `--manuel`, every skill and every command gets
 * `disable-model-invocation: true`: nothing loads, nothing triggers, and everything stays callable
 * by its name. `--auto` goes back to the ordinary mode. A skill that upstream reserves for the agent
 * (`user-invocable: false`) would then be unreachable — Claude Code's documentation says that field
 * takes it away from the person, and `disable-model-invocation` from the agent: in `--manuel`, it
 * becomes callable by its name like the rest of the plug-in.
 *
 * **`--licence <fichier>` attaches a licence text when the archive carries none.** This repository is
 * public: installing a plug-in here is redistributing it. Anthropic's Design plug-in is the example —
 * its licence (Apache 2.0) sits at the root of the upstream repository and not in the plug-in's
 * directory, so the archive does not carry it. The supplied text is kept with the provenance and
 * taken back on every update, otherwise the first one would erase it without a word; a plug-in with
 * no licence at all is reported.
 *
 * **Three rules, each answering a defect we would have had without it:**
 *
 *   1. **Every installed name is prefixed by the plug-in's.** Marketing and Product Management both
 *      ship `competitive-brief`, and Engineering brings `code-review`, the name of the built-in
 *      `/code-review`: without a prefix, a skill's name would depend on the installation order. A
 *      name that already carries the prefix keeps it as is (`auth0-android`, not
 *      `auth0-auth0-android`), and a plug-in name that is too long is replaced with `--prefixe` —
 *      Product Tracking's led past the 64 characters allowed.
 *      **The DIRECTORY names the skill, not the `name` field of its front matter** — measured on
 *      2026-09-24 (Claude Code 2.1.281): an `essai-dossier` directory whose front matter said
 *      `essai-entete` showed up under the first name. The field is rewritten anyway, so the two never
 *      disagree: the day a tool reads the other one, the prefix still holds. **And references
 *      follow**: an instruction that offers "→ `/write-spec`" would otherwise send to a command that
 *      does not exist here — Product Management had thirteen such lines at its first installation.
 *      Relative links too: each of its skills points at `../../CONNECTORS.md`, which now leads to the
 *      copy kept with the provenance instead of a `.claude/CONNECTORS.md` that does not exist.
 *      A manifest can keep its skills somewhere other than `skills/` (UI UX Pro Max: under
 *      `.claude/skills/`): those paths add to the default, and a path that leaves the plug-in is
 *      refused.
 *   2. **Hooks, connectors and agents are never installed by this script.** A hook runs code on every
 *      session event, a connector opens access to a third-party account, an agent picks its own
 *      tools: each is a decision, made by hand after reading. They are listed in
 *      `installation.json` and in the output, so none goes missing silently. A skill or a command
 *      that declares hooks in its front matter is refused, for the same reason.
 *   3. **Nothing is written until everything has been checked** — archive entries that would leave
 *      their directory, symbolic links, unreadable front matter, name collisions. A refusal leaves
 *      the repository as it was. Nothing is removed before being checked either: the names read back
 *      from `installation.json`, by an update as by `--retirer`, are validated first — the file lives
 *      in the repository, which a PR can modify, and a name like `../../src` in it would erase
 *      something other than a skill.
 *
 * **What the script cannot see: what the instructions SAY.** It prints what deserves a look —
 * addresses, shell commands, pre-authorised tools, links that lead to nothing installed, upstream
 * names the rewrite did not recognise as references, files that are not instructions — but an
 * instruction can ask for anything without containing any of that. They are reread before
 * committing.
 *
 * The instructions' text is not translated: a translation would make every update impossible to
 * replay. This repository's rules come before them (CLAUDE.md).
 *
 * Tested by breaking it: the mutations and their count are at the top of
 * `src/__tests__/installer-un-plugin.test.ts`.
 */

import { Buffer } from "node:buffer";
import { execFileSync } from "node:child_process";
import crypto from "node:crypto";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import process from "node:process";

const USAGE =
  "Usage: node scripts/installer-un-plugin.mjs <archive.zip | dossier> [--prefixe <court>] [--manuel | --auto] [--licence <fichier>] [--racine <dépôt>]\n" +
  "       node scripts/installer-un-plugin.mjs --retirer <plug-in> [--racine <dépôt>]";

/** What Claude Code accepts as a skill name: lowercase letters and digits, hyphens between them but
 * never at an edge nor doubled, 64 characters at most. */
const NAME = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const MAX_LENGTH = 64;

/** Where each plug-in's provenance lives, relative to the repository root — in POSIX form, because
 * the path is also written into the installed files. */
const PROVENANCE = ".claude/plugins-importes";

/** What is kept next to the provenance: the licence and the notice, which Apache 2.0 requires to
 * redistribute, and `CONNECTORS.md`, which explains the `~~category` the instructions use. */
const KEPT = /^((LICENSE|NOTICE|COPYING)(\.[a-z]+)?|CONNECTORS\.md)$/i;

/** Among what is kept, what is a licence — a notice alone is not one. */
const LICENSE_FILE = /^(LICENSE|COPYING)(\.[a-z]+)?$/i;

/** What is read without being installed: the documentation of an upstream repository and the
 * manifests of other agents (Codex, Cursor, Gemini…) that a plug-in published for several tools
 * carries at its root. The upstream README is not kept: it documents the names from before the
 * prefix, so it would be wrong about every command it quotes. Everything else at the root is
 * reported. */
const IGNORED =
  /^(README|CHANGELOG|CONTRIBUTING|CODE_OF_CONDUCT|SECURITY)(\.[a-z]+)*$|^\.git(ignore|attributes|hub)?$|^\.releaserc(\.[a-z]+)?$|^\.(codex|cursor|grok)-plugin$|^\.agents$|^(gemini-extension|kimi\.plugin)\.json$/i;

/** The entries at a plug-in's root that the script understands. Any other is reported. */
const KNOWN = new Set([".claude-plugin", "skills", "commands", "agents", "hooks", ".mcp.json"]);

/** How each kind of `non_installe` is named in the output, and why it is not installed. The keys are
 * `installation.json`'s (Ramille's), the words are this repository's. */
const NOT_INSTALLED_KINDS = {
  hooks: ["hooks", "run code on every event"],
  connecteurs: ["connectors", "open access to a third-party account"],
  agents: ["agents", "pick their own tools"],
  autres: ["other", "the script cannot install them"],
};

/** The lines that deserve a look before committing. Neither exhaustive nor blocking: a list of what
 * we know how to recognise, not a proof that the rest is sound. */
const WORTH_A_LOOK = [
  [/https?:\/\//, "address"],
  [/\b(curl|wget|sudo)\b|rm -rf|\|\s*(ba)?sh\b|\beval\(|base64/, "shell command"],
  [/^allowed-tools:/, "pre-authorised tools"],
];

class Refusal extends Error {}

function refuse(message) {
  throw new Refusal(message);
}

function parseArgs(argv) {
  let root = path.join(import.meta.dirname, "..");
  let source = null;
  let remove = null;
  let license = null;
  let prefix;
  let manual;
  const args = [...argv];
  while (args.length > 0) {
    const arg = args.shift();
    if (arg === "--racine") {
      const value = args.shift();
      if (!value) refuse("--racine expects a directory.");
      root = path.resolve(value);
    } else if (arg === "--retirer") {
      remove = args.shift();
      if (!remove) refuse("--retirer expects the name of an installed plug-in.");
    } else if (arg === "--licence") {
      const value = args.shift();
      if (!value) refuse("--licence expects a file.");
      license = path.resolve(value);
      if (!fs.existsSync(license) || !fs.statSync(license).isFile()) refuse(`--licence: file not found: ${license}`);
    } else if (arg === "--manuel" || arg === "--auto") {
      manual = arg === "--manuel";
    } else if (arg === "--prefixe") {
      prefix = args.shift();
      if (!prefix) refuse("--prefixe expects a prefix.");
    } else if (arg.startsWith("-")) {
      refuse(`unknown option: ${arg}\n${USAGE}`);
    } else if (source === null) {
      source = path.resolve(arg);
    } else {
      refuse(`one archive at a time.\n${USAGE}`);
    }
  }
  if (remove !== null) {
    // An archive, a prefix or a mode next to it means the wrong command was typed: guessing which one
    // was meant would be worse than refusing, since one of the two erases.
    if (source !== null || prefix !== undefined || manual !== undefined || license !== null) {
      refuse(`--retirer takes only the plug-in's name (and --racine).\n${USAGE}`);
    }
    return { remove, root };
  }
  if (source === null) refuse(USAGE);
  if (!fs.existsSync(source)) refuse(`not found: ${source}`);
  return { source, root, prefix, manual, license };
}

/** A directory is read as is; an archive is opened in a temporary directory, and its fingerprint is
 * kept so we know later which archive was installed. */
function openSource(source) {
  if (fs.statSync(source).isDirectory()) return { directory: source, temporary: null, sha256: null };
  if (!source.toLowerCase().endsWith(".zip")) refuse(`neither a directory nor a .zip archive: ${source}`);
  const sha256 = crypto.createHash("sha256").update(fs.readFileSync(source)).digest("hex");
  const failure = (error) => String(error.stderr ?? error.message).trim();

  // An entry in `../` or with an absolute path would write outside the extraction directory. `unzip`
  // discards them by itself — measured on 2026-09-24 (UnZip 6.00): `../evasion.txt` is placed INSIDE
  // the directory, and `unzip -q` exits 0 without a word. But a guard that depends on one version's
  // behaviour is not a guard: the list of entries is read first, and a single one is enough.
  let entries;
  try {
    entries = execFileSync("unzip", ["-Z1", source], { encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] });
  } catch (error) {
    refuse(`the archive cannot be read: ${failure(error)}`);
  }
  const escapes = entries.split("\n").filter((name) => name.startsWith("/") || name.split(/[\\/]/).includes(".."));
  if (escapes.length > 0) refuse(`the archive tries to write outside its directory: ${escapes.join(", ")}.`);

  const temporary = fs.mkdtempSync(path.join(os.tmpdir(), "tdg-plugin-"));
  try {
    execFileSync("unzip", ["-q", source, "-d", temporary], { stdio: ["ignore", "ignore", "pipe"] });
  } catch (error) {
    fs.rmSync(temporary, { recursive: true, force: true });
    refuse(`the archive does not open cleanly: ${failure(error)}`);
  }
  return { directory: temporary, temporary, sha256 };
}

/** The plug-in's root is the directory that holds `.claude-plugin/plugin.json`: the archive's own,
 * or the single directory it contains — both shapes circulate. */
function pluginRoot(directory) {
  const candidates = [
    directory,
    ...fs
      .readdirSync(directory, { withFileTypes: true })
      .filter((entry) => entry.isDirectory())
      .map((entry) => path.join(directory, entry.name)),
  ];
  const found = candidates.filter((d) => fs.existsSync(path.join(d, ".claude-plugin", "plugin.json")));
  if (found.length === 0) {
    refuse("no `.claude-plugin/plugin.json`, neither at the root nor one level down: this is not a plug-in.");
  }
  if (found.length > 1) refuse("several plug-ins in the same archive: one at a time.");
  return found[0];
}

function walk(directory, visit) {
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const entryPath = path.join(directory, entry.name);
    visit(entryPath, entry);
    if (entry.isDirectory()) walk(entryPath, visit);
  }
}

/** A symbolic link copied into the repository could point at any file of the machine that installs
 * it — a key, a token. No legitimate plug-in needs one. */
function refuseSymlinks(root) {
  walk(root, (entryPath, entry) => {
    if (entry.isSymbolicLink()) {
      refuse(`symbolic link in the plug-in: ${path.relative(root, entryPath)}.`);
    }
  });
}

/** The YAML front matter of an instructions file: the lines between the two leading `---`. */
function frontMatter(text) {
  const lines = text.split("\n");
  if (lines[0].trim() !== "---") return null;
  const end = lines.findIndex((line, i) => i > 0 && line.trim() === "---");
  return end === -1 ? null : { lines, end };
}

/** The line of a top-level field of the front matter, or -1. */
function fieldLine(front, key) {
  for (let i = 1; i < front.end; i += 1) {
    if (front.lines[i].startsWith(`${key}:`)) return i;
  }
  return -1;
}

/** True if the front matter reserves the file for the agent: `user-invocable: false`. */
function reservedForAgent(text) {
  const front = frontMatter(text);
  const index = front === null ? -1 : fieldLine(front, "user-invocable");
  return index !== -1 && /^user-invocable:\s*['"]?false['"]?\s*$/i.test(front.lines[index].replace(/\r$/, ""));
}

/** Reads the front matter of an instructions file and refuses what rule 2 forbids. A skill without
 * front matter has neither name nor description, and Claude Code would not present it; a command can
 * do without — its name is the file's. */
function readInstructions(file, root, { frontMatterRequired }) {
  const relative = path.relative(root, file);
  const text = fs.readFileSync(file, "utf8");
  const front = frontMatter(text);
  if (front === null) {
    if (frontMatterRequired) refuse(`${relative} has no front matter (--- … ---): Claude Code would not read it.`);
    return { reservedForAgent: false };
  }
  if (fieldLine(front, "hooks") !== -1) {
    refuse(`${relative} declares hooks in its front matter: they would run on every use (rule 2).`);
  }
  return { reservedForAgent: reservedForAgent(text) };
}

/** The installed name: the prefix, then the upstream name — except when the latter already carries
 * the prefix. Auth0 names its skills `auth0-android`: a systematic prefix would make that
 * `auth0-auth0-android`, and Modern Web Guidance would get a `modern-web-guidance-modern-web-guidance`.
 * A name that starts with the prefix is already filed under it, so rule 1 holds; the rare collision
 * the exception makes possible (`a` + `b-c` against `a-b` + `c`) is stopped by `plan`. */
function installedName(prefix, name, where) {
  if (!NAME.test(name)) refuse(`${where}: "${name}" is not a valid name (lowercase letters, digits, hyphens).`);
  const installed = name === prefix || name.startsWith(`${prefix}-`) ? name : `${prefix}-${name}`;
  if (installed.length > MAX_LENGTH) {
    refuse(`${where}: "${installed}" is longer than ${MAX_LENGTH} characters — a shorter prefix is given with --prefixe.`);
  }
  return installed;
}

function readManifest(root) {
  let manifest;
  try {
    manifest = JSON.parse(fs.readFileSync(path.join(root, ".claude-plugin", "plugin.json"), "utf8"));
  } catch (error) {
    refuse(`.claude-plugin/plugin.json cannot be read: ${error.message}`);
  }
  if (typeof manifest.name !== "string" || !NAME.test(manifest.name)) {
    refuse(`plugin.json: "${manifest.name}" is not a valid plug-in name (lowercase letters, digits, hyphens).`);
  }
  return manifest;
}

/** Where to look for skills or commands: the default directory, plus the ones the manifest declares —
 * they add to the default without replacing it, as Claude Code reads them. UI UX Pro Max keeps its
 * skills under `.claude/skills/` that way. A path that would leave the plug-in is refused: it would
 * designate anything at all. */
function declaredPaths(manifest, key) {
  const declared = manifest[key] === undefined ? [] : [manifest[key]].flat();
  if (!declared.every((element) => typeof element === "string")) {
    refuse(`plugin.json "${key}": unsupported shape, install by hand.`);
  }
  const paths = declared.map((entry) => {
    const normal = path.posix.normalize(entry).replace(/\/+$/, "");
    if (normal === ".." || normal.startsWith("../") || path.posix.isAbsolute(normal)) {
      refuse(`plugin.json "${key}" leaves the plug-in: ${entry}.`);
    }
    return normal;
  });
  return [...new Set([key, ...paths])];
}

function takeInventory(root, manifest, prefix) {
  // The keys of `notInstalled` are written as is into `installation.json`: they keep Ramille's names.
  const notInstalled = { hooks: [], connecteurs: [], agents: [], autres: [] };
  const skills = [];
  const commands = [];
  const kept = [];
  const relativeTo = (entryPath) => path.relative(root, entryPath).split(path.sep).join("/");

  const skillDirectories = declaredPaths(manifest, "skills");
  const commandPaths = declaredPaths(manifest, "commands");
  const known = new Set([...KNOWN, ...[...skillDirectories, ...commandPaths].map((p) => p.split("/")[0])]);

  for (const entry of fs.readdirSync(root, { withFileTypes: true })) {
    if (known.has(entry.name)) continue;
    if (KEPT.test(entry.name) && entry.isFile()) kept.push(entry.name);
    else if (!IGNORED.test(entry.name)) notInstalled.autres.push(entry.name);
  }

  const under = (name) => path.join(root, name);

  for (const skillDirectory of skillDirectories.filter((d) => fs.existsSync(under(d)))) {
    for (const entry of fs.readdirSync(under(skillDirectory), { withFileTypes: true })) {
      const directory = path.join(under(skillDirectory), entry.name);
      const file = path.join(directory, "SKILL.md");
      if (!entry.isDirectory() || !fs.existsSync(file)) {
        notInstalled.autres.push(`${skillDirectory}/${entry.name}`);
        continue;
      }
      // The upstream name is the directory's, not the front matter's: it is the one Claude Code
      // presents (rule 1), so it is the one the person may have read or typed elsewhere.
      const read = readInstructions(file, root, { frontMatterRequired: true });
      const name = entry.name;
      const installed = installedName(prefix, name, relativeTo(directory));
      skills.push({ upstream: name, installed, directory, relative: relativeTo(directory), reservedForAgent: read.reservedForAgent });
    }
  }

  // A commands path is a directory of `.md` files, or a single `.md`.
  for (const commandPath of commandPaths.filter((p) => fs.existsSync(under(p)))) {
    const files = fs.statSync(under(commandPath)).isDirectory()
      ? fs.readdirSync(under(commandPath), { withFileTypes: true }).map((entry) => ({ entry, file: path.join(under(commandPath), entry.name) }))
      : [{ entry: { name: path.basename(commandPath), isFile: () => true }, file: under(commandPath) }];
    for (const { entry, file } of files) {
      if (!entry.isFile() || !entry.name.endsWith(".md")) {
        notInstalled.autres.push(relativeTo(file));
        continue;
      }
      const read = readInstructions(file, root, { frontMatterRequired: false });
      const name = entry.name.slice(0, -".md".length);
      const installed = installedName(prefix, name, relativeTo(file));
      commands.push({ upstream: name, installed, file, relative: relativeTo(file), reservedForAgent: read.reservedForAgent });
    }
  }

  if (fs.existsSync(under("hooks"))) {
    walk(under("hooks"), (entryPath, entry) => {
      if (entry.isFile()) notInstalled.hooks.push(path.relative(root, entryPath));
    });
  }
  if (manifest.hooks !== undefined) notInstalled.hooks.push('plugin.json "hooks"');

  if (fs.existsSync(under(".mcp.json"))) {
    try {
      const mcp = JSON.parse(fs.readFileSync(under(".mcp.json"), "utf8"));
      notInstalled.connecteurs.push(...Object.keys(mcp.mcpServers ?? mcp));
    } catch {
      notInstalled.connecteurs.push(".mcp.json (unreadable)");
    }
  }
  if (manifest.mcpServers !== undefined) {
    const declared = manifest.mcpServers;
    notInstalled.connecteurs.push(...(typeof declared === "object" ? Object.keys(declared) : [`plugin.json "${declared}"`]));
  }

  // An agent is `agents/reviewer.md` or `agents/reviewer/AGENT.md`: it is called `reviewer` in both
  // cases.
  if (fs.existsSync(under("agents"))) {
    walk(under("agents"), (entryPath, entry) => {
      if (!entry.isFile()) return;
      notInstalled.agents.push(path.relative(under("agents"), entryPath).replace(/\.md$/i, "").replace(/\/AGENT$/i, ""));
    });
  }
  if (manifest.agents !== undefined) notInstalled.agents.push('plugin.json "agents"');

  for (const key of ["lspServers", "outputStyles"]) {
    if (manifest[key] !== undefined) notInstalled.autres.push(`plugin.json "${key}"`);
  }

  // A skill and a command with the same name would become two `/prefix-name`: one would hide the other.
  const names = [...skills, ...commands].map((element) => element.installed);
  const duplicates = names.filter((name, i) => names.indexOf(name) !== i);
  if (duplicates.length > 0) refuse(`two elements of the plug-in would carry the same name: ${[...new Set(duplicates)].join(", ")}.`);

  if (skills.length === 0 && commands.length === 0) {
    const contents = Object.entries(notInstalled)
      .filter(([, list]) => list.length > 0)
      .map(([kind, list]) => `${NOT_INSTALLED_KINDS[kind][0]}: ${list.join(", ")}`);
    refuse(`nothing this script installs — neither skill nor command. Contents: ${contents.join("; ") || "empty"}.`);
  }

  const byName = (a, b) => a.installed.localeCompare(b.installed);
  for (const list of Object.values(notInstalled)) list.sort();
  return {
    manifest,
    name: manifest.name,
    prefix,
    skills: skills.sort(byName),
    commands: commands.sort(byName),
    kept: kept.sort(),
    notInstalled,
  };
}

const escapeRegExp = (text) => text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

/** What follows a name for it to be a whole reference: `/write-spec`, `` `/write-spec` `` or
 * `/write-spec $ARGUMENTS`, but never the start of `/write-spec-bis` nor of `/write-spec/`. */
const NAME_END = "(?=$|[\\s`'\")\\],.;:!?])";

/** Rewrites references to upstream names — `/write-spec` and `product-management:write-spec` become
 * `/product-management-write-spec`. Without it, an instruction offering "→ `/write-spec`" would send
 * to a command that does not exist here. A reference is only recognised on its own:
 * `skills/write-spec/` is a path, it stays as is and `toReview` reports it. The `plugin:skill` form
 * carries the plug-in's NAME, which is not always the chosen prefix. */
function rewriteReferences(text, inventory) {
  let result = text;
  for (const { upstream, installed } of [...inventory.skills, ...inventory.commands]) {
    result = result
      .replace(new RegExp(`(^|[\\s\`'"(\\[])/${escapeRegExp(upstream)}${NAME_END}`, "gm"), `$1/${installed}`)
      .replace(
        new RegExp(`(^|[^a-z0-9-])${escapeRegExp(inventory.name)}:${escapeRegExp(upstream)}${NAME_END}`, "gm"),
        `$1${installed}`,
      );
  }
  return result;
}

/** Where a file of the plug-in ends up once installed, relative to the repository root — or `null`
 * if it is not installed. This is the table that lets a relative link be recomputed. */
function destination(relative, inventory) {
  for (const skill of inventory.skills) {
    if (relative === skill.relative || relative.startsWith(`${skill.relative}/`)) {
      return path.posix.join(".claude/skills", skill.installed, relative.slice(skill.relative.length));
    }
  }
  const command = inventory.commands.find((element) => element.relative === relative);
  if (command) return `.claude/commands/${command.installed}.md`;
  if (relative === ".claude-plugin/plugin.json" || inventory.kept.includes(relative)) {
    return path.posix.join(PROVENANCE, inventory.name, path.posix.basename(relative));
  }
  return null;
}

/** The target of a Markdown link `[text](target)`. */
const LINK = /\]\(([^)\s]+)\)/g;

/** Recomputes a file's relative links for its new place. Every Product Management skill points at
 * `../../CONNECTORS.md`: moved as is, the link would have led to `.claude/CONNECTORS.md`, which does
 * not exist. A link to an installed element or to a file kept with the provenance follows; a link to
 * something that is not installed — or that does not exist upstream — stays as is and goes into
 * `dead`, which `toReview` prints. */
function rewriteLinks(text, origin, target, context) {
  return text.replace(LINK, (whole, link) => {
    if (/^([a-z][a-z0-9+.-]*:|#|\/)/i.test(link)) return whole;
    const [, linkPath, rest] = link.match(/^([^#?]*)(.*)$/);
    const aimed = path.posix.normalize(path.posix.join(path.posix.dirname(origin), linkPath));
    const arrival = aimed.startsWith("..") ? null : destination(aimed, context.inventory);
    if (arrival === null || !fs.existsSync(path.join(context.pluginRoot, aimed))) {
      context.dead.push(link);
      return whole;
    }
    return `](${path.posix.relative(path.posix.dirname(target), arrival)}${rest})`;
  });
}

/** Sets a top-level field of the front matter — `name` to the installed name (rule 1), or
 * `disable-model-invocation` in `--manuel`. A command without front matter gets one. */
function setField(text, key, value) {
  const front = frontMatter(text);
  if (front === null) return `---\n${key}: ${value}\n---\n${text}`;
  const index = fieldLine(front, key);
  const line = `${key}: ${value}`;
  if (index === -1) front.lines.splice(front.end, 0, line);
  else front.lines[index] = front.lines[index].endsWith("\r") ? `${line}\r` : line;
  return front.lines.join("\n");
}

/** In `--manuel`, a skill or a command only triggers when called by its name, and its description no
 * longer loads into the context of every session — measured on 2026-09-24: a skill carrying
 * `disable-model-invocation: true` disappears from the list Claude Code presents, its control without
 * the field stays in it. That is the place for a useful but talkative plug-in. A file that upstream
 * reserves for the agent would become unreachable there: it is given back to the person. */
function applyManualMode(text, inventory) {
  if (!inventory.manual) return text;
  const manual = setField(text, "disable-model-invocation", "true");
  return reservedForAgent(manual) ? setField(manual, "user-invocable", "true") : manual;
}

/** The start of the notice a modified file carries — written once, because `toReview` must
 * recognise it so as not to read it as an instruction. */
const NOTICE = "<!-- Modified for Tour de Growth by scripts/installer-un-plugin.mjs";

/** A modified file carries a notice that says so: Apache 2.0 requires it of whoever redistributes a
 * changed file, and it is how a reader knows the file is no longer upstream's. */
function markModified(original, modified, inventory) {
  if (modified === original) return original;
  const { name, prefix } = inventory;
  const version = inventory.manifest.version ?? "no version";
  return (
    `${modified.replace(/\n*$/, "\n")}\n${NOTICE}: ` +
    `names prefixed with "${prefix}-" (name field, references to commands) and relative links recomputed` +
    `${inventory.manual ? ", manual invocation only (disable-model-invocation; user-invocable restored if it was false)" : ""}. ` +
    `Plug-in ${name} ${version}; ` +
    `licence and provenance in ${PROVENANCE}/${name}/. -->\n`
  );
}

/** Everything the installation will write, computed in memory before the first write (rule 3).
 * Instruction files are transformed; the others are copied as is, permissions included. Paths are in
 * POSIX form: they are also the ones the recomputed links write. */
function prepareWrites(inventory, root) {
  const writes = [];
  const instructions = (origin, target, transform = (text) => text) => {
    const original = fs.readFileSync(origin, "utf8");
    const context = { inventory, pluginRoot: root, dead: [] };
    const relative = path.relative(root, origin).split(path.sep).join("/");
    const modified = rewriteLinks(rewriteReferences(transform(original), inventory), relative, target, context);
    const text = markModified(original, modified, inventory);
    writes.push({ origin, target, text, deadLinks: context.dead, size: Buffer.byteLength(text) });
  };
  for (const skill of inventory.skills) {
    walk(skill.directory, (entryPath, entry) => {
      if (!entry.isFile()) return;
      const relative = path.relative(skill.directory, entryPath).split(path.sep).join("/");
      const target = path.posix.join(".claude/skills", skill.installed, relative);
      if (relative === "SKILL.md") {
        instructions(entryPath, target, (text) => applyManualMode(setField(text, "name", skill.installed), inventory));
      } else if (entryPath.endsWith(".md")) instructions(entryPath, target);
      else writes.push({ origin: entryPath, target, text: null, deadLinks: [], size: fs.statSync(entryPath).size });
    });
  }
  for (const command of inventory.commands) {
    instructions(command.file, `.claude/commands/${command.installed}.md`, (text) => applyManualMode(text, inventory));
  }
  return writes;
}

/** What runs, as opposed to what is read: a script or a binary is reread one by one before
 * committing, a piece of data (`.csv`, `.ttf`, `.json`…) is counted. */
const EXECUTABLE = /\.(py|js|cjs|mjs|ts|tsx|jsx|sh|bash|zsh|rb|pl|php|ps1|bat|cmd|exe|bin|so|dylib|dll|jar|wasm)$|(^|\/)[^./]+$/i;

/** What, in what is about to be installed, deserves to be reread: scripts, suspicious lines, dead
 * links, and upstream names the rewrite did not recognise as references — a path
 * `skills/write-spec/`, for instance. Data files are counted, not listed: UI UX Pro Max ships two
 * hundred, which would drown the forty scripts that must be read. */
function toReview(writes, inventory) {
  // An upstream name left as is is only looked for among those that CHANGED, and whole: a name that
  // already carries the prefix is not renamed (`/tool` stays `/tool`), and `/tool-idea` — rightly
  // rewritten — contains `/tool` without designating it. And only where it designates something:
  // alone like a reference the rewrite missed, or as a path segment (`skills/update/`). Glued to a
  // word, it is prose — "Create/update memory" in Productivity, which has an `update` skill — and
  // reporting it would drown the real leftovers.
  const renamed = [...inventory.skills, ...inventory.commands]
    .filter((element) => element.upstream !== element.installed)
    .map((element) => escapeRegExp(element.upstream));
  const names = renamed.join("|");
  const upstreamLeftover =
    renamed.length > 0 ? new RegExp(`(^|[\\s\`'"(\\[])/(${names})(?![a-z0-9-])|/(${names})/`) : null;
  // The `plugin:skill` form is only a reference when followed by a real name of the plug-in: Auth0
  // writes `com.auth0.android:auth0:3.x`, a Gradle coordinate and not a skill.
  const all = [...inventory.skills, ...inventory.commands].map((element) => escapeRegExp(element.upstream));
  const namespacedReference = new RegExp(`(^|[^a-z0-9.-])${escapeRegExp(inventory.name)}:(${all.join("|")})(?![a-z0-9-])`);
  const remarks = [];
  const data = new Map();
  for (const { target, text, deadLinks } of writes) {
    if (text === null) {
      if (EXECUTABLE.test(target)) {
        remarks.push(`${target} — script or binary: read what it does`);
      } else {
        const extension = path.posix.extname(target).toLowerCase() || "(no extension)";
        data.set(extension, (data.get(extension) ?? 0) + 1);
      }
      continue;
    }
    for (const link of deadLinks) remarks.push(`${target} (link to a file that is not installed) — ${link}`);
    text.split("\n").forEach((line, index) => {
      if (line.startsWith(NOTICE)) return;
      const reasons = WORTH_A_LOOK.filter(([pattern]) => pattern.test(line)).map(([, reason]) => reason);
      if (namespacedReference.test(line) || upstreamLeftover?.test(line)) {
        reasons.push("upstream name left as is");
      }
      if (reasons.length > 0) {
        remarks.push(`${target}:${index + 1} (${reasons.join(", ")}) — ${line.trim().slice(0, 120)}`);
      }
    });
  }
  if (data.size > 0) {
    const counts = [...data].sort(([, a], [, b]) => b - a).map(([extension, n]) => `${n} × ${extension}`);
    remarks.push(`data, copied as is: ${counts.join(", ")}`);
  }
  return remarks;
}

function exists(entryPath) {
  return fs.lstatSync(entryPath, { throwIfNoEntry: false }) !== undefined;
}

const skillPath = (name) => path.join(".claude", "skills", name);
const commandPath = (name) => path.join(".claude", "commands", `${name}.md`);

/** The last installation of this plug-in, as `installation.json` describes it — or `null`. Every name
 * read back is validated before it is used to remove anything (rule 3). */
function previousInstallation(repo, name) {
  const relative = `${PROVENANCE}/${name}/installation.json`;
  const file = path.join(repo, relative);
  if (!exists(file)) return null;
  const installation = JSON.parse(fs.readFileSync(file, "utf8"));
  const invalid = [...(installation.skills ?? []), ...(installation.commandes ?? [])]
    .map((element) => element?.installe)
    .filter((installed) => typeof installed !== "string" || !NAME.test(installed));
  if (invalid.length > 0) {
    refuse(`${relative} carries a name that is not one: ${invalid.map((n) => `"${n}"`).join(", ")}. Nothing was touched.`);
  }
  return installation;
}

/** The licence text to keep with the provenance when the archive carries none: the one supplied, or
 * else the one supplied at the last installation — read now, because `write` erases the provenance
 * before putting it back. */
function suppliedLicense(inventory, repo, previous, requested) {
  if (inventory.kept.some((name) => LICENSE_FILE.test(name))) {
    if (requested) refuse("the archive already carries its licence: --licence has nothing to add. Nothing was written.");
    return null;
  }
  const previousSupplied = previous?.licence_fournie ? path.join(repo, PROVENANCE, inventory.name, "LICENSE") : null;
  const source = requested ?? previousSupplied;
  if (source === null || !exists(source)) return null;
  const contents = fs.readFileSync(source);
  return { contents, sha256: crypto.createHash("sha256").update(contents).digest("hex") };
}

/** What the installation will write and remove — computed entirely before the first write. */
function plan(inventory, repo, previous, requestedLicense) {
  const provenance = path.join(repo, PROVENANCE, inventory.name);
  const license = suppliedLicense(inventory, repo, previous, requestedLicense);

  // What the previous version installed is ours: it is replaced without being a collision.
  // `installation.json` is the only source of that list.
  const toRemove = [
    ...(previous?.skills ?? []).map((skill) => skillPath(skill.installe)),
    ...(previous?.commandes ?? []).map((command) => commandPath(command.installe)),
  ];

  const targets = [
    ...inventory.skills.map((skill) => skillPath(skill.installed)),
    ...inventory.commands.map((command) => commandPath(command.installed)),
  ];
  const collisions = targets.filter((target) => exists(path.join(repo, target)) && !toRemove.includes(target));
  if (collisions.length > 0) {
    refuse(`already present, and not installed by this plug-in: ${collisions.join(", ")}. Nothing was written.`);
  }
  return { provenance, toRemove, previous, license };
}

function write(writes, inventory, planned, repo, root, opened, source) {
  for (const relative of planned.toRemove) fs.rmSync(path.join(repo, relative), { recursive: true, force: true });
  fs.rmSync(planned.provenance, { recursive: true, force: true });

  for (const { origin, target, text } of writes) {
    const destinationPath = path.join(repo, target);
    fs.mkdirSync(path.dirname(destinationPath), { recursive: true });
    if (text === null) fs.copyFileSync(origin, destinationPath);
    else fs.writeFileSync(destinationPath, text);
  }

  fs.mkdirSync(planned.provenance, { recursive: true });
  fs.copyFileSync(path.join(root, ".claude-plugin", "plugin.json"), path.join(planned.provenance, "plugin.json"));
  for (const name of inventory.kept) fs.copyFileSync(path.join(root, name), path.join(planned.provenance, name));
  if (planned.license) fs.writeFileSync(path.join(planned.provenance, "LICENSE"), planned.license.contents);

  // Ramille's keys, kept as they are (see the header): a provenance directory reads the same in both
  // repositories.
  const installation = {
    plugin: inventory.name,
    prefixe: inventory.prefix,
    manuel: inventory.manual,
    version: inventory.manifest.version ?? null,
    source: path.basename(source),
    sha256: opened.sha256,
    ...(planned.license ? { licence_fournie: { fichier: "LICENSE", sha256: planned.license.sha256 } } : {}),
    installe_le: new Date().toLocaleDateString("sv-SE", { timeZone: "Europe/Paris" }),
    installe_par: "scripts/installer-un-plugin.mjs",
    skills: inventory.skills.map(({ upstream, installed }) => ({ amont: upstream, installe: installed })),
    commandes: inventory.commands.map(({ upstream, installed }) => ({ amont: upstream, installe: installed })),
    non_installe: inventory.notInstalled,
  };
  fs.writeFileSync(path.join(planned.provenance, "installation.json"), `${JSON.stringify(installation, null, 2)}\n`);
}

function report(inventory, planned, remarks, writes) {
  const { manifest } = inventory;
  const bytes = writes.reduce((sum, { size }) => sum + size, 0);
  const lines = [
    `Plug-in ${manifest.name} ${manifest.version ?? "(no version)"} installed — ${writes.length} file(s), ` +
      `${(bytes / 1024 / 1024).toLocaleString("en-GB", { maximumFractionDigits: 1 })} MB.`,
    "",
  ];
  if (inventory.manual) {
    lines.push("  Manual invocation only: nothing loads or triggers on its own (kept for updates).", "");
  }
  if (inventory.prefix !== inventory.name) lines.push(`  Prefix: ${inventory.prefix}- (kept for updates).`, "");
  if (planned.previous) lines.push(`  Replaces version ${planned.previous.version ?? "(no version)"}.`, "");
  if (planned.license) {
    lines.push("  Licence: supplied at installation, the archive carrying none (kept for updates).", "");
  } else if (!inventory.kept.some((name) => LICENSE_FILE.test(name))) {
    lines.push("  No licence: the archive carries none, and the repository is public — --licence <fichier> attaches one.", "");
  }
  const givenBack = [...inventory.skills, ...inventory.commands].filter((element) => element.reservedForAgent);
  if (inventory.manual && givenBack.length > 0) {
    lines.push(`  Reserved for the agent upstream, made callable by their name: ${givenBack.map(({ installed }) => `/${installed}`).join(", ")}.`, "");
  }
  const list = (title, elements) => {
    if (elements.length === 0) return;
    lines.push(`  ${title}:`);
    for (const { upstream, installed } of elements) lines.push(`    /${installed}  ("${upstream}" upstream)`);
    lines.push("");
  };
  list(`${inventory.skills.length} skill(s)`, inventory.skills);
  list(`${inventory.commands.length} command(s)`, inventory.commands);

  const notInstalled = Object.entries(inventory.notInstalled).filter(([, elements]) => elements.length > 0);
  if (notInstalled.length > 0) {
    lines.push("  Not installed — a decision to make by hand, after reading:");
    for (const [kind, elements] of notInstalled) {
      const [label, reason] = NOT_INSTALLED_KINDS[kind];
      lines.push(`    ${label} (${reason}): ${elements.join(", ")}`);
    }
    lines.push("");
  }

  lines.push(remarks.length > 0 ? "  To reread before committing:" : "  Nothing reported to reread — which does not excuse reading the instructions.");
  for (const remark of remarks) lines.push(`    ${remark}`);
  lines.push("", `  Provenance: ${PROVENANCE}/${inventory.name}/`);
  console.log(lines.join("\n"));
}

/** Undoes an installation: what `installation.json` says it installed, then the provenance. Never a
 * name pattern — `<prefix>-*` would take a skill written here under a neighbouring name, which nothing
 * tells apart from a skill of the plug-in except that list. */
function removePlugin(repo, name) {
  if (!NAME.test(name)) refuse(`"${name}" is not a valid plug-in name.`);
  const installation = previousInstallation(repo, name);
  if (installation === null) {
    const directory = path.join(repo, PROVENANCE);
    const installed = exists(directory)
      ? fs.readdirSync(directory, { withFileTypes: true }).filter((entry) => entry.isDirectory()).map((entry) => entry.name).sort()
      : [];
    refuse(
      `no plug-in "${name}" is installed here (${PROVENANCE}/${name}/installation.json does not exist). ` +
        `Installed: ${installed.length > 0 ? installed.join(", ") : "none"}.`,
    );
  }
  const skills = installation.skills ?? [];
  const commands = installation.commandes ?? [];
  for (const { installe } of skills) fs.rmSync(path.join(repo, skillPath(installe)), { recursive: true, force: true });
  for (const { installe } of commands) fs.rmSync(path.join(repo, commandPath(installe)), { force: true });
  fs.rmSync(path.join(repo, PROVENANCE, name), { recursive: true, force: true });

  console.log(
    [
      `Plug-in ${name} ${installation.version ?? "(no version)"} removed — ${skills.length} skill(s), ` +
        `${commands.length} command(s), and its provenance.`,
      "",
      ...[...skills, ...commands].map(({ installe }) => `  /${installe}`),
      "",
      "  Whatever mentions it elsewhere in the repository (CLAUDE.md, a document) is left to reread by hand.",
    ].join("\n"),
  );
}

let opened = null;

function install({ source, root: repo, prefix: requestedPrefix, manual: requestedManual, license: requestedLicense }) {
  opened = openSource(source);
  const root = pluginRoot(opened.directory);
  refuseSymlinks(root);
  const manifest = readManifest(root);
  const previous = previousInstallation(repo, manifest.name);
  // The requested prefix wins; otherwise the last installation's, so an update renames nothing;
  // otherwise the plug-in's name.
  const prefix = requestedPrefix ?? previous?.prefixe ?? manifest.name;
  if (!NAME.test(prefix)) refuse(`--prefixe: "${prefix}" is not a valid prefix (lowercase letters, digits, hyphens).`);
  const manual = requestedManual ?? previous?.manuel ?? false;
  const inventory = { ...takeInventory(root, manifest, prefix), manual };
  const planned = plan(inventory, repo, previous, requestedLicense);
  const writes = prepareWrites(inventory, root);
  const remarks = toReview(writes, inventory);
  write(writes, inventory, planned, repo, root, opened, source);
  report(inventory, planned, remarks, writes);
}

try {
  const request = parseArgs(process.argv.slice(2));
  if (request.remove) removePlugin(request.root, request.remove);
  else install(request);
} catch (error) {
  if (!(error instanceof Refusal)) throw error;
  console.error(`Refused: ${error.message}`);
  process.exitCode = 1;
} finally {
  if (opened?.temporary) fs.rmSync(opened.temporary, { recursive: true, force: true });
}
