import type { Metadata } from "next";
import { cookies } from "next/headers";
import { Button } from "@/components/core/Button";
import { Card } from "@/components/core/Card";
import { MetaLabel } from "@/components/brand/MetaLabel";
import { WordmarkLink } from "@/components/brand/WordmarkLink";
import { ENGINE_PATH, engineEnvFlag } from "@/lib/engine/access";
import {
  OWNER_PREVIEW_PATH,
  PREVIEW_COOKIES,
  PREVIEW_FEATURES,
  hasOwnerPreview,
  type PreviewFeature,
} from "@/lib/owner-preview";
import styles from "./page.module.css";

/**
 * `/admin/preview` — where the owner opens the features that ship closed, on
 * his own browser only (`lib/owner-preview.ts`).
 *
 * `proxy.ts` gates all of `/admin/*` behind `ADMIN_DASHBOARD_PASSWORD`, and it
 * is also the proxy that answers the forms below (`POST ?game=on`…): it mints
 * the signed cookie and sends a 303 back here, so this page only reads. POST
 * rather than links, because a GET that toggles something is fired by every
 * prefetcher and unfurler that sees it.
 *
 * French only, like `/admin/audit`: an internal surface, not a product one.
 */
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Aperçu propriétaire — Tour de Growth",
  robots: { index: false, follow: false },
};

type State = "everyone" | "this-browser" | "closed";

const FEATURES: Record<PreviewFeature, { name: string; path: string; env: () => string | undefined; envName: string }> = {
  game: { name: "Le jeu « Le côté obscur »", path: "/game", env: () => process.env.GAME_ENABLED, envName: "GAME_ENABLED" },
  engine: { name: "Le moteur de croissance", path: ENGINE_PATH, env: engineEnvFlag, envName: "ENGINE_ENABLED" },
};

const STATE_LABEL: Record<State, string> = {
  everyone: "Ouvert pour tout le monde",
  "this-browser": "Ouvert sur ce navigateur seulement",
  closed: "Fermé sur ce navigateur",
};

async function stateOf(feature: PreviewFeature): Promise<State> {
  if (FEATURES[feature].env() === "true") return "everyone";
  const cookie = (await cookies()).get(PREVIEW_COOKIES[feature])?.value;
  return (await hasOwnerPreview(feature, cookie)) ? "this-browser" : "closed";
}

export default async function OwnerPreviewPage() {
  const states = Object.fromEntries(
    await Promise.all(PREVIEW_FEATURES.map(async (f) => [f, await stateOf(f)] as const)),
  ) as Record<PreviewFeature, State>;

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <WordmarkLink locale="fr" size="sm" />
        <MetaLabel size="xs" wide>Admin</MetaLabel>
      </header>

      <main id="main" className={styles.main}>
        <h1 className={styles.h1}>Aperçu propriétaire</h1>
        <p className={styles.lede}>
          Ouvre le jeu et le moteur sur ce navigateur seulement, pendant qu’ils restent fermés pour tout le
          monde. Le cookie est signé avec le mot de passe admin : personne ne peut le fabriquer, et changer ce mot
          de passe dans Vercel révoque tous les aperçus d’un coup.
        </p>

        <div className={styles.list}>
          {PREVIEW_FEATURES.map((feature) => {
            const { name, path, envName } = FEATURES[feature];
            const state = states[feature];
            return (
              <Card key={feature} elevation="panel" className={styles.card} data-testid={`preview-${feature}`}>
                <h2 className={styles.h2}>{name}</h2>
                <p className={styles.state} data-testid={`preview-state-${feature}`} data-state={state}>
                  {STATE_LABEL[state]}
                  {state === "everyone" ? ` (${envName}=true dans Vercel)` : null}
                </p>
                <p className={styles.links}>
                  {(["fr", "en"] as const).map((locale) => (
                    <a key={locale} className={styles.link} href={`/${locale}${path}`}>
                      /{locale}
                      {path}
                    </a>
                  ))}
                </p>
                <div className={styles.actions}>
                  <form method="post" action={`${OWNER_PREVIEW_PATH}?${feature}=on`}>
                    <Button type="submit" variant="primary" data-testid={`preview-on-${feature}`}>
                      Ouvrir sur ce navigateur
                    </Button>
                  </form>
                  <form method="post" action={`${OWNER_PREVIEW_PATH}?${feature}=off`}>
                    <Button type="submit" variant="secondary" data-testid={`preview-off-${feature}`}>
                      Refermer
                    </Button>
                  </form>
                </div>
              </Card>
            );
          })}
        </div>

        <p className={styles.note}>
          Ouvrir pour tout le monde, c’est autre chose : poser <code>GAME_ENABLED</code> ou{" "}
          <code>ENGINE_ENABLED</code> à <code>true</code> dans Vercel, puis redéployer — une variable modifiée
          n’atteint que les nouveaux déploiements.
        </p>
      </main>
    </div>
  );
}
