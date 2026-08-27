import { cert, getApps, initializeApp, type App } from "firebase-admin/app";
import { getFirestore, type Firestore } from "firebase-admin/firestore";

let app: App | undefined;

/**
 * Lazily initializes the Firebase Admin SDK from server-only env vars
 * (never exposed to the browser — this file must only ever be imported
 * from server code: Route Handlers, not "use client" components).
 *
 * Throws a clear, specific error if credentials are missing rather than
 * letting the Admin SDK fail with an opaque one — this is exactly the kind
 * of server/browser boundary mixup CLAUDE.md's lesson #4 warns about, so
 * failing loudly and early matters here.
 */
function getAdminApp(): App {
  if (app) return app;

  const existing = getApps();
  if (existing[0]) {
    app = existing[0];
    return app;
  }

  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n");

  if (!projectId || !clientEmail || !privateKey) {
    throw new Error(
      "Firebase Admin credentials are missing — set FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, and FIREBASE_PRIVATE_KEY (see .env.local).",
    );
  }

  app = initializeApp({ credential: cert({ projectId, clientEmail, privateKey }) });
  return app;
}

export function getDb(): Firestore {
  return getFirestore(getAdminApp());
}
