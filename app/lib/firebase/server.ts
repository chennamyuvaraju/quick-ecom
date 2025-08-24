import { App, cert, getApps, initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { getStorage } from "firebase-admin/storage";

let adminApp: App | undefined;

export function getAdminApp(): App {
	if (!adminApp) {
		if (!process.env.FIREBASE_PROJECT_ID) {
			throw new Error("FIREBASE_PROJECT_ID not set");
		}
		adminApp = initializeApp({
			credential: cert({
				projectId: process.env.FIREBASE_PROJECT_ID,
				clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
				privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
			}),
			storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
		}, getApps().length ? undefined : undefined);
	}
	return adminApp;
}

export const db = () => getFirestore(getAdminApp());
export const bucket = () => getStorage(getAdminApp()).bucket();