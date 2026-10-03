"use client";

import { Button } from "@/components/core/Button";
import { AskList } from "@/components/engine/AskList";
import { shapeOf } from "@/lib/engine/catalog-shape";
import { buildRequest } from "@/lib/engine/request";
import { ROLE_KEY } from "@/lib/engine/strings";
import type { MetricId, RoleId } from "@/lib/engine/types";
import { RequestCopy } from "./RequestCopy";
import { fill, formatDate, metricById } from "./text";
import type { EngineActions, EngineView } from "./view";
import styles from "./Screens.module.css";

/**
 * The requests, one screen (design system extension 07, `AskList`; A18
 * T3.c): the numbers that come from someone else, one card per role, each
 * with its request as it will be copied. Copying stamps every number of the
 * card with the request and its date — the model keeps one request per
 * number, as « À aller chercher » did — and the card then says when, on its
 * pending edge.
 *
 * The cards are the numbers the screen opened with (`ids`, from the next
 * step's « Demande tes {n} chiffres » or from « Enregistre et continue »),
 * frozen: a card copied stays, with its date, rather than vanishing from
 * under the person. Grouped by the role each is asked of — its default, as
 * the collect plan groups them — in the funnel's order.
 */
export function AskScreen({
  ids,
  view,
  actions,
  doneLabel,
  onDone,
  onBack,
}: {
  ids: readonly MetricId[];
  view: EngineView;
  actions: EngineActions;
  doneLabel: string;
  onDone: () => void;
  onBack: () => void;
}) {
  const { strings, state, ctx, metrics } = view;
  const snapshot = state.snapshots[state.snapshots.length - 1]!;
  const groups: { role: RoleId; ids: MetricId[] }[] = [];
  for (const id of ids) {
    const role = snapshot.metrics[id]?.request?.role ?? shapeOf(id).defaultRole;
    const group = groups.find((g) => g.role === role);
    if (group) group.ids.push(id);
    else groups.push({ role, ids: [id] });
  }
  const statusOf = (id: MetricId) => snapshot.metrics[id]?.status ?? "todo";

  return (
    <div className={styles.numberScreen} data-testid="engine-asks-screen">
      <div>
        <Button variant="quiet" onClick={onBack} data-testid="engine-asks-back">
          {strings.list.back}
        </Button>
      </div>
      <AskList
        title={fill(strings.asks.title, { n: ids.length })}
        lead={strings.asks.lead}
        groups={groups.map((g) => {
          const toAsk = g.ids.filter((id) => statusOf(id) === "todo");
          // The day it was copied: the earliest of the card's requests (one copy stamps them all).
          const copiedAt = g.ids
            .map((id) => snapshot.metrics[id]?.request?.requestedAt)
            .filter((at): at is string => Boolean(at))
            .sort()[0];
          return {
            id: g.role,
            role: strings.role[ROLE_KEY[g.role]],
            numbers: g.ids.map((id) => metricById(metrics, id).name).join(" · "),
            request: buildRequest(g.role, g.ids, strings, metrics, state, ctx),
            copied: toAsk.length === 0 && copiedAt ? fill(strings.sheet.askCopied, { date: formatDate(copiedAt, ctx.locale) }) : undefined,
            action: (
              // Mounted even once copied: its confirmation, its fallback text and « Me le rappeler » outlive the copy.
              <RequestCopy
                key={`ask-${g.role}`}
                role={g.role}
                ids={toAsk}
                label={toAsk.length === 1 ? strings.request.copy : fill(strings.request.copyGroup, { n: toAsk.length })}
                view={view}
                quietStatus
                onCopied={() => actions.markRequested(toAsk, g.role)}
              />
            ),
            "data-testid": `engine-asks-${g.role}`,
          };
        })}
        done={{ label: doneLabel, onClick: onDone, "data-testid": "engine-asks-done" }}
        data-testid="engine-asks"
      />
    </div>
  );
}
