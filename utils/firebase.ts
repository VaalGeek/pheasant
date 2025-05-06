// utils/firebase.ts
import admin from 'firebase-admin'


if (!admin.apps.length) {

  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_projectId,
      privateKey: process.env.FIREBASE_privateKey,
      clientEmail: process.env.FIREBASE_clientEmail,
    }),
  });


}

export default admin
