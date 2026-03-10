import * as admin from "firebase-admin"

export const FirebaseProvider = {
    provide: 'FIREBASE_ADMIN',
    useFactory: () => {
        admin.initializeApp({
            credential: admin.credential.applicationDefault(),
        });
        return admin;
    },
};

