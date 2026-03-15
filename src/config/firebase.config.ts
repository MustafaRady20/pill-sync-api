import * as admin from 'firebase-admin';
import * as fs from 'fs';
import * as path from 'path';

export function initializeFirebase(): void {
  if (admin.apps.length > 0) return; 

  const filePath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH;

 if (!filePath) {
    throw new Error('FIREBASE_SERVICE_ACCOUNT_PATH env variable is not set');
  }

  const serviceAccount = JSON.parse(
    fs.readFileSync(path.resolve(filePath), 'utf8'),
  );
  if (!serviceAccount) {
    throw new Error(
      'FIREBASE_SERVICE_ACCOUNT_JSON environment variable is not set.',
    );
  }

  admin.initializeApp({
    credential: admin.credential.cert(JSON.parse(serviceAccount)),
  });
}