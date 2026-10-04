import { Button, Disclosure, EngineBar, Select } from "tour-de-growth";

/*
 * The engine bar at the head of the board (design system extension 07,
 * A18 T2.a): one line that says which engine, how it sells and which month,
 * the « Jamais sauvegardé » tag while a file is owed, the settings, and the
 * menu — « Ce moteur », « Mois », « Fichier » — that holds everything that
 * is not the next step.
 *
 * Every prop is the product's own: `BoardBar` (app/[locale]/aarrr-funnel-
 * template/_engine/BoardHead.tsx) run on the engine's fixtures with the
 * resolved copy, the board's month series and the device's one engine built
 * as EngineWorkbench builds them; its element's props are what it hands
 * EngineBar. The island's `EngineSwitcher` is drawn as the closed
 * `Disclosure` it renders.
 */

const noop = () => {};

/**
 * The page's example (`exampleState()`, `lib/engine/__tests__/fixtures.ts`), in French, as the
 * board opens: the line says which engine (no company typed, so « Moteur sans nom »), how it
 * sells and which month; the dashed tag says it was never saved to a file; the menu is closed
 * and the settings sit on the right. Nothing in the bar is primary. The bar reads the same on
 * a first visit and on a return: only the backup tag moves, with the file.
 */
export const NeverSaved = () => (
  <div style={{ maxWidth: 760 }}>
    <EngineBar
      line={"Moteur sans nom · libre-service · août 2026"}
      pending={"Jamais sauvegardé"}
      menuLabel={"Moteur, mois et fichier"}
      groups={[
        {
          title: "Ce moteur",
          items: [
            <Disclosure key="switcher" size="sm" rule={false} summary={"Changer ou ajouter un moteur"}>
              <Button variant="secondary" size="sm" onClick={noop}>{"Nouveau moteur"}</Button>
            </Disclosure>,
            <Button key="engine-rename" variant="quiet" size="sm" onClick={noop}>{"Renommer"}</Button>,
          ],
        },
        {
          title: "Mois",
          items: [
            <Button key="engine-month-remind" variant="quiet" size="sm" onClick={noop}>{"Me rappeler de démarrer septembre 2026"}</Button>,
          ],
        },
        {
          title: "Fichier",
          items: [
            <Button key="engine-save-json" variant="quiet" size="sm" onClick={noop}>{"Sauvegarder (.json)"}</Button>,
            <Button key="engine-import-open-screen" variant="quiet" size="sm" onClick={noop}>{"Importer un fichier"}</Button>,
            <Button key="engine-table-open" variant="quiet" size="sm" onClick={noop}>{"Saisie en tableau"}</Button>,
            <Button key="engine-delete-open" variant="quiet" size="sm" onClick={noop}>{"Supprimer ce moteur"}</Button>,
            <Button key="engine-erase-open" variant="quiet" size="sm" onClick={noop}>{"Tout effacer sur cet appareil"}</Button>,
          ],
        },
      ]}
      note={"Ton moteur n'existe que dans ce navigateur. Safari peut effacer les données d'un site après sept jours d'utilisation de Safari sans passage sur ce site : sauvegarde-le dans un fichier."}
      settingsLabel={"Réglages"}
      onSettings={noop}
    />
  </div>
);

/**
 * The same engine in English with the menu open — the product opens it on a click; `menuOpen`
 * is how a still shows it. Three groups: « This engine » (the switcher, the island's
 * `EngineSwitcher`, drawn as the closed sm `Disclosure` it renders — its list of the device's
 * engines is island markup and is left out here — then « Rename »), « Month » (one month only,
 * so no month selector: the reminder to start September, whose flows are not over on the 24th)
 * and « File », then the backup sentence closing the menu, there while the engine has never
 * been saved. At a viewport under 760px the three groups stack in one column (a media query,
 * not the card's width: not drawn here).
 */
export const MenuOpen = () => (
  <div style={{ maxWidth: 760 }}>
    <EngineBar
      line={"Unnamed engine · self-serve · August 2026"}
      pending={"Never saved"}
      menuLabel={"Engine, month and file"}
      groups={[
        {
          title: "This engine",
          items: [
            <Disclosure key="switcher" size="sm" rule={false} summary={"Switch or add an engine"}>
              <Button variant="secondary" size="sm" onClick={noop}>{"New engine"}</Button>
            </Disclosure>,
            <Button key="engine-rename" variant="quiet" size="sm" onClick={noop}>{"Rename"}</Button>,
          ],
        },
        {
          title: "Month",
          items: [
            <Button key="engine-month-remind" variant="quiet" size="sm" onClick={noop}>{"Remind me to start September 2026"}</Button>,
          ],
        },
        {
          title: "File",
          items: [
            <Button key="engine-save-json" variant="quiet" size="sm" onClick={noop}>{"Save (.json)"}</Button>,
            <Button key="engine-import-open-screen" variant="quiet" size="sm" onClick={noop}>{"Import a file"}</Button>,
            <Button key="engine-table-open" variant="quiet" size="sm" onClick={noop}>{"Enter as a table"}</Button>,
            <Button key="engine-delete-open" variant="quiet" size="sm" onClick={noop}>{"Delete this engine"}</Button>,
            <Button key="engine-erase-open" variant="quiet" size="sm" onClick={noop}>{"Erase everything on this device"}</Button>,
          ],
        },
      ]}
      note={"Your engine only exists in this browser. Safari may erase a site's data after seven days of Safari use without a visit to that site: save it to a file."}
      menuOpen
      settingsLabel={"Settings"}
      onSettings={noop}
    />
  </div>
);

/**
 * The example in French, saved to a file at 08:00 and changed at 09:00 (`lastExportedAt`
 * before `updatedAt`): the dashed tag now gives the last save's date instead of « Jamais
 * sauvegardé ». Menu closed (the backup sentence is still in it).
 */
export const ChangedSinceSave = () => (
  <div style={{ maxWidth: 760 }}>
    <EngineBar
      line={"Moteur sans nom · libre-service · août 2026"}
      pending={"Dernière sauvegarde : 24 septembre 2026"}
      menuLabel={"Moteur, mois et fichier"}
      groups={[
        {
          title: "Ce moteur",
          items: [
            <Disclosure key="switcher" size="sm" rule={false} summary={"Changer ou ajouter un moteur"}>
              <Button variant="secondary" size="sm" onClick={noop}>{"Nouveau moteur"}</Button>
            </Disclosure>,
            <Button key="engine-rename" variant="quiet" size="sm" onClick={noop}>{"Renommer"}</Button>,
          ],
        },
        {
          title: "Mois",
          items: [
            <Button key="engine-month-remind" variant="quiet" size="sm" onClick={noop}>{"Me rappeler de démarrer septembre 2026"}</Button>,
          ],
        },
        {
          title: "Fichier",
          items: [
            <Button key="engine-save-json" variant="quiet" size="sm" onClick={noop}>{"Sauvegarder (.json)"}</Button>,
            <Button key="engine-import-open-screen" variant="quiet" size="sm" onClick={noop}>{"Importer un fichier"}</Button>,
            <Button key="engine-table-open" variant="quiet" size="sm" onClick={noop}>{"Saisie en tableau"}</Button>,
            <Button key="engine-delete-open" variant="quiet" size="sm" onClick={noop}>{"Supprimer ce moteur"}</Button>,
            <Button key="engine-erase-open" variant="quiet" size="sm" onClick={noop}>{"Tout effacer sur cet appareil"}</Button>,
          ],
        },
      ]}
      note={"Ton moteur n'existe que dans ce navigateur. Safari peut effacer les données d'un site après sept jours d'utilisation de Safari sans passage sur ce site : sauvegarde-le dans un fichier."}
      settingsLabel={"Réglages"}
      onSettings={noop}
    />
  </div>
);

/**
 * The example with a month before it (`withMonthBefore(exampleState())`), saved since its last
 * change, in French, with July picked in the menu: the line ends « lecture seule ». No backup
 * tag or note (the file is up to date). « Mois » now holds the month selector (`Select`,
 * newest first, July shown) above the reminder; « Fichier » has no « Saisie en tableau »,
 * which only writes the month being filled. Menu open, as after a click.
 */
export const PastMonth = () => (
  <div style={{ maxWidth: 760 }}>
    <EngineBar
      line={"Moteur sans nom · libre-service · juillet 2026 · lecture seule"}
      menuLabel={"Moteur, mois et fichier"}
      groups={[
        {
          title: "Ce moteur",
          items: [
            <Disclosure key="switcher" size="sm" rule={false} summary={"Changer ou ajouter un moteur"}>
              <Button variant="secondary" size="sm" onClick={noop}>{"Nouveau moteur"}</Button>
            </Disclosure>,
            <Button key="engine-rename" variant="quiet" size="sm" onClick={noop}>{"Renommer"}</Button>,
          ],
        },
        {
          title: "Mois",
          items: [
            <Select key="month" label={"Mois affiché"} size="sm" fit="content" value={"0"} onChange={noop} options={[{ value: "1", label: "août 2026" }, { value: "0", label: "juillet 2026" }]} />,
            <Button key="engine-month-remind" variant="quiet" size="sm" onClick={noop}>{"Me rappeler de démarrer septembre 2026"}</Button>,
          ],
        },
        {
          title: "Fichier",
          items: [
            <Button key="engine-save-json" variant="quiet" size="sm" onClick={noop}>{"Sauvegarder (.json)"}</Button>,
            <Button key="engine-import-open-screen" variant="quiet" size="sm" onClick={noop}>{"Importer un fichier"}</Button>,
            <Button key="engine-delete-open" variant="quiet" size="sm" onClick={noop}>{"Supprimer ce moteur"}</Button>,
            <Button key="engine-erase-open" variant="quiet" size="sm" onClick={noop}>{"Tout effacer sur cet appareil"}</Button>,
          ],
        },
      ]}
      menuOpen
      settingsLabel={"Réglages"}
      onSettings={noop}
    />
  </div>
);

/**
 * The sales-assisted half of the hybrid example (`salesAssistedState()`), saved, in English:
 * on its own, sales-assisted reads three months of flows, so the line gives the range « June
 * to August 2026 » instead of one month. No tag; menu closed.
 */
export const SalesAssisted = () => (
  <div style={{ maxWidth: 760 }}>
    <EngineBar
      line={"Unnamed engine · sales-assisted · June to August 2026"}
      menuLabel={"Engine, month and file"}
      groups={[
        {
          title: "This engine",
          items: [
            <Disclosure key="switcher" size="sm" rule={false} summary={"Switch or add an engine"}>
              <Button variant="secondary" size="sm" onClick={noop}>{"New engine"}</Button>
            </Disclosure>,
            <Button key="engine-rename" variant="quiet" size="sm" onClick={noop}>{"Rename"}</Button>,
          ],
        },
        {
          title: "Month",
          items: [
            <Button key="engine-month-remind" variant="quiet" size="sm" onClick={noop}>{"Remind me to start September 2026"}</Button>,
          ],
        },
        {
          title: "File",
          items: [
            <Button key="engine-save-json" variant="quiet" size="sm" onClick={noop}>{"Save (.json)"}</Button>,
            <Button key="engine-import-open-screen" variant="quiet" size="sm" onClick={noop}>{"Import a file"}</Button>,
            <Button key="engine-table-open" variant="quiet" size="sm" onClick={noop}>{"Enter as a table"}</Button>,
            <Button key="engine-delete-open" variant="quiet" size="sm" onClick={noop}>{"Delete this engine"}</Button>,
            <Button key="engine-erase-open" variant="quiet" size="sm" onClick={noop}>{"Erase everything on this device"}</Button>,
          ],
        },
      ]}
      settingsLabel={"Settings"}
      onSettings={noop}
    />
  </div>
);
