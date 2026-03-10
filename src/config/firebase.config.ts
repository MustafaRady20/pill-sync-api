import * as admin from 'firebase-admin';

export function initializeFirebase(): void {
  if (admin.apps.length > 0) return; 

  const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;

  if (!serviceAccount) {
    throw new Error(
      'FIREBASE_SERVICE_ACCOUNT_JSON environment variable is not set.',
    );
  }

  admin.initializeApp({
    credential: admin.credential.cert(JSON.parse(serviceAccount)),
  });
}