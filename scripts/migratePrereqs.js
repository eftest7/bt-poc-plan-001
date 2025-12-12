// Migration script to move prerequisites from 'prerequisites' to 'solutionPrerequisites'
// Run this script to fix the collection name mismatch
// Usage: node scripts/migratePrereqs.js

import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, getDocs, deleteDoc, doc, serverTimestamp } from 'firebase/firestore';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const firebaseConfig = {
    apiKey: process.env.VITE_FIREBASE_API_KEY,
    authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.VITE_FIREBASE_APP_ID,
    measurementId: process.env.VITE_FIREBASE_MEASUREMENT_ID
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function migratePrereqs() {
    console.log('🔄 Starting prerequisite migration...\n');

    try {
        // Get all documents from old collection
        const oldCollectionSnapshot = await getDocs(collection(db, 'prerequisites'));

        if (oldCollectionSnapshot.empty) {
            console.log('ℹ️  No prerequisites found in "prerequisites" collection.');
            console.log('   Checking "solutionPrerequisites" collection...\n');

            const newCollectionSnapshot = await getDocs(collection(db, 'solutionPrerequisites'));
            console.log(`✅ Found ${newCollectionSnapshot.size} prerequisites in "solutionPrerequisites" collection.`);

            if (newCollectionSnapshot.size === 0) {
                console.log('\n⚠️  No prerequisites found in either collection!');
                console.log('   Run the seed script: node scripts/seedDatabase.js\n');
            }

            process.exit(0);
        }

        console.log(`📋 Found ${oldCollectionSnapshot.size} prerequisites to migrate.\n`);

        let migratedCount = 0;
        const oldDocIds = [];

        // Copy documents to new collection
        for (const docSnapshot of oldCollectionSnapshot.docs) {
            const data = docSnapshot.data();

            console.log(`   Migrating: ${data.text.substring(0, 60)}...`);

            // Add to new collection
            await addDoc(collection(db, 'solutionPrerequisites'), {
                ...data,
                // Preserve existing timestamps or create new ones
                createdAt: data.createdAt || serverTimestamp(),
                updatedAt: serverTimestamp()
            });

            oldDocIds.push(docSnapshot.id);
            migratedCount++;
        }

        console.log(`\n✅ Successfully migrated ${migratedCount} prerequisites.\n`);

        // Ask if we should delete old collection data
        console.log('⚠️  Old prerequisites still exist in "prerequisites" collection.');
        console.log('   You can manually delete them from Firebase Console if needed.\n');

        process.exit(0);
    } catch (error) {
        console.error('❌ Error during migration:', error);
        process.exit(1);
    }
}

// Run the migration
migratePrereqs();
