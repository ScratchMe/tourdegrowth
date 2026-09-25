/**
 * `core/Button`'s loading state (ds-critique H-6).
 *
 * Component assertions live in e2e/ against real pages — but no page renders
 * a loading button today: both long waits (the score submit, the Deep dive
 * submit) swap the whole screen for LoadingScreen the moment they start, so
 * the button that started them is already unmounted. Until a caller holds a
 * button on screen through a request, the only way to pin the contract is to
 * call the component as the plain function it is and read the element it
 * returns. No DOM, no renderer: `Button` has no hooks, so this is exact.
 *
 * What is pinned is the part a caller relies on and cannot see: `loading`
 * must disable the button (a request in flight must not be sent twice) and
 * announce itself (`aria-busy`), and must not leak onto the DOM as an
 * unknown attribute.
 */
import type { ReactElement } from "react";
import { describe, expect, it } from "vitest";
import { Button } from "@/components/core/Button";

type ButtonElementProps = Record<string, unknown>;

function render(props: Parameters<typeof Button>[0]): { type: unknown; props: ButtonElementProps } {
  const element = Button(props) as ReactElement<ButtonElementProps>;
  return { type: element.type, props: element.props };
}

describe("Button loading", () => {
  it("disables the button and marks it busy", () => {
    const { type, props } = render({ children: "Get my score", loading: true });
    expect(type).toBe("button");
    expect(props.disabled).toBe(true);
    expect(props["aria-busy"]).toBe(true);
  });

  it("does not forward `loading` as a DOM attribute", () => {
    const { props } = render({ children: "Get my score", loading: true });
    expect(props).not.toHaveProperty("loading");
  });

  it("leaves an idle button enabled and carries no aria-busy at all", () => {
    const { props } = render({ children: "Get my score" });
    expect(props.disabled).toBeFalsy();
    // Absent rather than "false": a stray aria-busy="false" on every button
    // in the product is noise in the accessibility tree.
    expect(props["aria-busy"]).toBeUndefined();
  });

  it("keeps a caller's own `disabled` when not loading", () => {
    const { props } = render({ children: "Save", disabled: true });
    expect(props.disabled).toBe(true);
    expect(props["aria-busy"]).toBeUndefined();
  });
});
