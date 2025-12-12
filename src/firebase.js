// Firebase configuration - Hardcoded for reliability
// No environment variables needed

import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAnalytics, isSupported } from 'firebase/analytics';

// Debug logging helper
const DEBUG = true;
const log = (message, data = null) => {
    if (DEBUG) {
        const timestamp = new Date().toISOString();
        console.log(`[Firebase ${timestamp}] ${message}`, data !== null ? data : '');
    }
};

log('Starting Firebase initialization...');

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: "AIzaSyBJeS-H5DWgVUG7wrtenQcTdZY1Zl6amzI",
    authDomain: "bt-poc-efb54.firebaseapp.com",
    projectId: "bt-poc-efb54",
    storageBucket: "bt-poc-efb54.firebasestorage.app",
    messagingSenderId: "380939948572",
    appId: "1:380939948572:web:b834061442a5a20a1a45d9",
    measurementId: "G-G7B56X9XWH"
};

log('Firebase config loaded:', { projectId: firebaseConfig.projectId, authDomain: firebaseConfig.authDomain });

// Initialize Firebase with error handling
let app = null;
let db = null;
let analytics = null;
let initError = null;

try {
    log('Initializing Firebase app...');
    app = initializeApp(firebaseConfig);
    log('Firebase app initialized successfully');

    log('Initializing Firestore...');
    db = getFirestore(app);
    log('Firestore initialized successfully');

    // Initialize Analytics only if supported (not available in all environments)
    log('Checking Analytics support...');
    isSupported().then(supported => {
        if (supported) {
            analytics = getAnalytics(app);
            log('Analytics initialized successfully');
        } else {
            log('Analytics not supported in this environment (this is OK)');
        }
    }).catch(err => {
        log('Analytics check failed (non-critical):', err.message);
    });

} catch (error) {
    initError = error;
    console.error('[Firebase] CRITICAL: Firebase initialization failed:', error);
    log('Firebase initialization error:', { name: error.name, message: error.message, stack: error.stack });
}

// Export initialization status for components to check
export const firebaseStatus = {
    isInitialized: !!app && !!db,
    error: initError,
    getErrorMessage: () => initError ? initError.message : null
};

log('Firebase module loaded. Status:', { isInitialized: firebaseStatus.isInitialized, hasError: !!initError });

export { db, analytics };
export default app;
