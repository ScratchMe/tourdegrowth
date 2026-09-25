"use client";

import { useState } from "react";
import { Button } from "@/components/core/Button";
import styles from "./ShareRow.module.css";

export interface ShareRowProps {
  /** `share.replay`. */
  replayLabel: string;
  onReplay: () => void;
  /** `share.copy`. */
  copyLabel: string;
  /** `share.copied`, announced once the clipboard took the text. */
  copiedLabel: string;
  /**
   * `share.text`, filled — the title, the two figures and the URL of the
   * page in the CURRENT language (P18). The island builds it; this row only
   * carries it to the clipboard.
   */
  shareText: string;
  /** Fired on every click of the copy button, whatever the clipboard then did (`game_share`). */
  onShare?: () => void;
}

type Outcome = "idle" | "copied" | "fallback";

/**
 * Replay and share — GAME-BRIEF §5.11 point 6, §4 (« le partage reste, en bas,
 * en second plan »).
 *
 * No primary here: replay is secondary, copying is quiet. The share text
 * goes to the clipboard; when the clipboard is missing or refused (an
 * insecure context, a denied permission, an embedded browser), the text is
 * printed next to the button instead, selectable — P14: the player can still
 * copy it by hand, and nothing claims a copy that did not happen.
 *
 * One polite live region, present from the first render, says « Copié. »:
 * a region that appears together with its message is not announced.
 */
export function ShareRow({ replayLabel, onReplay, copyLabel, copiedLabel, shareText, onShare }: ShareRowProps) {
  const [outcome, setOutcome] = useState<Outcome>("idle");

  async function copy() {
    onShare?.();
    try {
      if (!navigator.clipboard) throw new Error("no clipboard");
      await navigator.clipboard.writeText(shareText);
      setOutcome("copied");
    } catch {
      setOutcome("fallback");
    }
  }

  return (
    <div className={styles.row}>
      <div className={styles.actions}>
        <Button variant="secondary" onClick={onReplay} data-testid="game-replay">
          {replayLabel}
        </Button>
        <Button variant="quiet" onClick={copy} data-testid="game-share">
          {copyLabel}
        </Button>
      </div>
      <p className={styles.status} role="status" data-testid="game-copied">
        {outcome === "copied" ? copiedLabel : null}
      </p>
      {outcome === "fallback" ? (
        <p className={styles.fallback} data-testid="game-share-fallback">
          {shareText}
        </p>
      ) : null}
    </div>
  );
}
