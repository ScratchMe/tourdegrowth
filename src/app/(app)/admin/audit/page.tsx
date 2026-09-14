import type { Metadata } from "next";
import Link from "next/link";
import { WordmarkLink } from "@/components/brand/WordmarkLink";
import { snapshotCatalog } from "@/lib/audit/server";
import { AuditWorkbench } from "./AuditWorkbench";
import styles from "./page.module.css";

/**
 * `/admin/audit` — l'instrument de diagnostic growth (AUDIT.md).
 *
 * Server Component : il résout le catalogue du jour et le passe en props.
 * L'îlot ne lit aucun module de `content/`, et `audit-boundary.test.ts`
 * marche ses imports pour que ça reste vrai quand les écrans arriveront.
 *
 * Rendu à la demande : `snapshotCatalog()` est instantané, mais la date du
 * jour l'est moins — une page prérendue figerait `today` au moment du build
 * et proposerait une date d'arrêté périmée à chaque nouvelle mission.
 *
 * `proxy.ts` garde déjà tout `/admin/*` derrière `ADMIN_DASHBOARD_PASSWORD`
 * (fail-closed si la variable n'est pas posée) ; cette page n'a aucune
 * logique d'authentification à elle, elle fait confiance au fait d'avoir été
 * laissée passer. Et `robots` la met hors index comme `/admin/stats`.
 */
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Diagnostic growth — Tour de Growth",
  robots: { index: false, follow: false },
};

export default function AuditPage() {
  const catalog = snapshotCatalog();
  const today = new Date().toISOString().slice(0, 10);

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <WordmarkLink locale="fr" />
        <nav className={styles.nav}>
          <Link className={styles.navLink} href="/admin/stats">
            Stats
          </Link>
        </nav>
      </header>
      <main className={styles.main}>
        <h1 className={styles.h1}>Diagnostic growth</h1>
        <p className={styles.lede}>
          Outil interne. Les missions vivent dans ce navigateur et dans les fichiers que tu exportes — jamais sur un serveur, jamais dans
          Firestore.
        </p>
        <AuditWorkbench catalog={catalog} today={today} />
      </main>
    </div>
  );
}
