"use client";

import { Component, type ReactNode } from "react";

interface Props {
  /** Called once per error: puts something drawable in place and says so (true), or gives up (false). */
  onError: () => boolean;
  children: ReactNode;
}

interface State {
  caught: boolean;
  fatal: boolean;
  error: unknown;
}

/**
 * The engine's net (A25.b). React catches a render's error only in a class,
 * so this is the island's one class component. On an error below it, it draws
 * nothing for one commit and asks `onError`; the caller puts something
 * drawable in place — the « illisible » screen, the import's refusal, the
 * device as it was — and the children are drawn again. When the caller has
 * nothing left, the error goes on to the page's own boundary, the « détour »
 * it always reached before A25.b.
 *
 * What it cannot see: an error in an event handler, which leaves the screen
 * as it was, and one in the server render, where the island draws nothing
 * (its store has no server snapshot).
 */
export class EngineBoundary extends Component<Props, State> {
  state: State = { caught: false, fatal: false, error: null };

  static getDerivedStateFromError(error: unknown): Partial<State> {
    return { caught: true, error };
  }

  componentDidCatch(): void {
    if (this.props.onError()) this.setState({ caught: false, error: null });
    else this.setState({ fatal: true });
  }

  render(): ReactNode {
    if (this.state.fatal) throw this.state.error;
    if (this.state.caught) return null;
    return this.props.children;
  }
}
