import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

/**
 * `.github/workflows/stats.yml` reads two secrets and runs on a PUBLIC
 * repository, whose workflow logs anyone can read. The contract that makes
 * that safe is mechanical, so it is pinned here: manual trigger only, read
 * permission only, actions pinned by commit, a recipient that must be an age
 * public key, an age binary pinned by checksum, and a report that reaches
 * the log only through `age -r`.
 */
const source = readFileSync(join(process.cwd(), ".github/workflows/stats.yml"), "utf8");

describe("the encrypted stats workflow", () => {
  it("runs on workflow_dispatch only — never on a pull request, a push or a schedule", () => {
    expect(source).toMatch(/^on:\s*\n\s+workflow_dispatch:/m);
    expect(source).not.toMatch(/^\s+(pull_request|pull_request_target|push|schedule):/m);
  });

  it("only reads the repository", () => {
    expect(source).toMatch(/permissions:\s*\n\s+contents: read/);
  });

  it("pins every action to a commit SHA, like verify-live.yml", () => {
    const uses = [...source.matchAll(/uses:\s*(\S+)/g)].map((m) => m[1]!);
    expect(uses.length).toBeGreaterThan(0);
    for (const ref of uses) expect(ref).toMatch(/@[0-9a-f]{40}$/);
  });

  it("refuses a recipient that is not an age public key, and pins the age binary by checksum", () => {
    expect(source).toContain("'^age1[0-9a-z]{58}$'");
    expect(source).toMatch(/[0-9a-f]{64}\s+age\.tgz"\s*\|\s*sha256sum -c -/);
    expect(source).toContain("releases/download/v1.2.1/age-v1.2.1-linux-amd64.tar.gz");
  });

  it("prints the report only after encrypting it to the run's recipient", () => {
    expect(source).toContain('age -r "$RECIPIENT" -a -o report.age report.tgz');
    // The plaintext files may only be WRITTEN (curl -o, a redirect) and SIZED
    // (`wc -c <`). Any other reference — a cat, an echo of their content, a
    // second redirect — is the plaintext reaching a public log.
    const allowed = [/-o report\/admin\.json/g, /> report\/gsc\.json/g, /wc -c < report\/(admin|gsc)\.json/g];
    for (const line of source.split("\n")) {
      const rest = allowed.reduce((l, re) => l.replace(re, ""), line);
      if (/report\/(admin|gsc)\.json/.test(rest)) {
        throw new Error(`plaintext report reaches the log: ${line.trim()}`);
      }
    }
    expect(source).toContain("cat report.age");
  });

  it("reads the dashboard through the JSON twin of /admin/stats, which the proxy gates like the page", () => {
    expect(source).toContain('"$SITE/admin/stats/json"');
    expect(source).toContain("secrets.ADMIN_DASHBOARD_PASSWORD");
    expect(source).toContain("secrets.GSC_SERVICE_ACCOUNT_JSON");
  });
});
