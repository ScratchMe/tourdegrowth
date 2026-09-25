import { createHmac } from "node:crypto";
import { afterEach, describe, expect, it } from "vitest";
import {
  PREVIEW_COOKIES,
  PREVIEW_FEATURES,
  hasOwnerPreview,
  ownerPreviewSecret,
  ownerPreviewToken,
  previewAction,
} from "../owner-preview";

const SECRET = "correct-horse-battery-staple";

describe("ownerPreviewToken", () => {
  it("is a plain HMAC-SHA256 of the namespaced feature name, base64url — checked against node:crypto", async () => {
    for (const feature of PREVIEW_FEATURES) {
      const expected = createHmac("sha256", SECRET).update(`tdg-owner-preview:v1:${feature}`).digest("base64url");
      expect(await ownerPreviewToken(feature, SECRET)).toBe(expected);
    }
  });

  it("is cookie-safe: 43 characters of the base64url alphabet, no padding", async () => {
    const token = await ownerPreviewToken("game", SECRET);
    expect(token).toMatch(/^[A-Za-z0-9_-]{43}$/);
  });

  it("differs per feature and per secret", async () => {
    const game = await ownerPreviewToken("game", SECRET);
    expect(await ownerPreviewToken("engine", SECRET)).not.toBe(game);
    expect(await ownerPreviewToken("game", `${SECRET}!`)).not.toBe(game);
    expect(await ownerPreviewToken("game", SECRET)).toBe(game);
  });
});

describe("hasOwnerPreview", () => {
  it("accepts exactly the signature for this feature under this secret", async () => {
    expect(await hasOwnerPreview("engine", await ownerPreviewToken("engine", SECRET), SECRET)).toBe(true);
    expect(await hasOwnerPreview("engine", await ownerPreviewToken("game", SECRET), SECRET)).toBe(false);
    expect(await hasOwnerPreview("engine", await ownerPreviewToken("engine", "other"), SECRET)).toBe(false);
  });

  it("refuses the values anyone reading the repository could guess", async () => {
    for (const value of ["1", "true", "preview", "", null, undefined]) {
      expect(await hasOwnerPreview("game", value, SECRET), String(value)).toBe(false);
    }
  });

  it("fails closed without a secret, even for a signature made with the empty string", async () => {
    // HMAC accepts an empty key, so this signature is computable by anyone;
    // an unset password must never make it valid.
    const empty = createHmac("sha256", "").update("tdg-owner-preview:v1:game").digest("base64url");
    expect(await hasOwnerPreview("game", empty, undefined)).toBe(false);
    expect(await hasOwnerPreview("game", empty, "")).toBe(false);
  });
});

describe("ownerPreviewSecret", () => {
  const ORIGINAL = process.env.ADMIN_DASHBOARD_PASSWORD;
  afterEach(() => {
    if (ORIGINAL === undefined) delete process.env.ADMIN_DASHBOARD_PASSWORD;
    else process.env.ADMIN_DASHBOARD_PASSWORD = ORIGINAL;
  });

  it("is the admin password, read at call time, and absent when it is empty", async () => {
    process.env.ADMIN_DASHBOARD_PASSWORD = SECRET;
    expect(ownerPreviewSecret()).toBe(SECRET);
    expect(await hasOwnerPreview("game", await ownerPreviewToken("game", SECRET))).toBe(true);
    process.env.ADMIN_DASHBOARD_PASSWORD = "";
    expect(ownerPreviewSecret()).toBeUndefined();
    delete process.env.ADMIN_DASHBOARD_PASSWORD;
    expect(ownerPreviewSecret()).toBeUndefined();
    expect(await hasOwnerPreview("game", await ownerPreviewToken("game", SECRET))).toBe(false);
  });
});

describe("previewAction and the cookie names", () => {
  it("reads only on and off", () => {
    expect(previewAction("on")).toBe("on");
    expect(previewAction("off")).toBe("off");
    for (const v of [null, "", "ON", "preview", "true", "1"]) expect(previewAction(v)).toBeNull();
  });

  it("keeps one cookie per feature, never shared", () => {
    expect(new Set(Object.values(PREVIEW_COOKIES)).size).toBe(PREVIEW_FEATURES.length);
  });
});
