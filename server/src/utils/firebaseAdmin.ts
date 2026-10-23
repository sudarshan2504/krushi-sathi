import { initializeApp, cert, getApps, getApp, App } from 'firebase-admin/app';
import { getAuth, Auth, DecodedIdToken } from 'firebase-admin/auth';
import { config } from '../config';

let app: App | null = null;
let auth: Auth | null = null;

/**
 * Checks whether Firebase Admin has minimum required credentials configured
 */
export function isFirebaseAdminConfigured(): boolean {
  const projectId = config.firebaseProjectId;
  return Boolean(projectId && projectId.trim() !== '' && projectId !== 'your_firebase_project_id');
}

/**
 * Initializes Firebase Admin SDK singleton using FIREBASE_PROJECT_ID
 * and optional FIREBASE_CLIENT_EMAIL / FIREBASE_PRIVATE_KEY if supplied.
 */
function initFirebaseAdmin(): { app: App; auth: Auth } {
  if (app && auth) {
    return { app, auth };
  }

  const existingApps = getApps();
  if (existingApps.length > 0) {
    app = getApp();
    auth = getAuth(app);
    return { app, auth };
  }

  const projectId = config.firebaseProjectId;
  const clientEmail = config.firebaseClientEmail;
  let privateKey = config.firebasePrivateKey;

  if (privateKey) {
    // Unescape literal \n strings in private keys (common in .env files)
    privateKey = privateKey.replace(/\\n/g, '\n');
  }

  if (clientEmail && privateKey) {
    // Full service account credentials supplied
    app = initializeApp({
      credential: cert({
        projectId: projectId || undefined,
        clientEmail,
        privateKey,
      }),
      projectId: projectId || undefined,
    });
  } else if (projectId) {
    // Project ID supplied (uses Google Application Default Credentials or public cert validation for ID tokens)
    app = initializeApp({
      projectId,
    });
  } else {
    // Fallback placeholder to prevent unhandled crash if credentials are not configured yet
    console.warn('[FirebaseAdmin] Warning: FIREBASE_PROJECT_ID is not set in server environment.');
    app = initializeApp({
      projectId: 'krushi-sathi-unconfigured',
    });
  }

  auth = getAuth(app);
  return { app, auth };
}

const initialized = initFirebaseAdmin();
app = initialized.app;
auth = initialized.auth;

/**
 * Compatibility wrapper supporting `admin.auth().verifyIdToken`
 */
export const admin = {
  get app() {
    return app!;
  },
  auth: () => {
    if (!auth) {
      auth = getAuth(app!);
    }
    return auth;
  },
};

/**
 * Verifies a Firebase ID token sent from the client
 */
export async function verifyFirebaseIdToken(idToken: string): Promise<DecodedIdToken> {
  if (!isFirebaseAdminConfigured()) {
    throw new Error('Firebase Admin is not configured on server. Please set FIREBASE_PROJECT_ID in server/.env');
  }
  return admin.auth().verifyIdToken(idToken);
}

export { auth, app };
export default admin;
