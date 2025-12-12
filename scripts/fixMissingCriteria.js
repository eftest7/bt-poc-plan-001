// Script to add missing success criteria for Identity Security Insights
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, getDocs, query, where, serverTimestamp } from 'firebase/firestore';
import dotenv from 'dotenv';

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

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const SUCCESS_CRITERIA_COLLECTION = 'successCriteria';
const SOLUTIONS_COLLECTION = 'solutions';

async function addMissingCriteria() {
    console.log('🔍 Finding Identity Security Insights solution...');

    // Find the Identity Security Insights solution
    const solutionsSnapshot = await getDocs(collection(db, SOLUTIONS_COLLECTION));
    let isiSolutionId = null;

    solutionsSnapshot.forEach((doc) => {
        if (doc.data().name === 'Identity Security Insights') {
            isiSolutionId = doc.id;
        }
    });

    if (!isiSolutionId) {
        console.log('❌ Identity Security Insights solution not found');
        process.exit(1);
    }

    console.log(`✓ Found solution ID: ${isiSolutionId}`);

    // Check existing success criteria for this solution
    const existingQuery = query(
        collection(db, SUCCESS_CRITERIA_COLLECTION),
        where('solutionId', '==', isiSolutionId)
    );
    const existingSnapshot = await getDocs(existingQuery);
    const existingCriteria = [];
    existingSnapshot.forEach((doc) => {
        existingCriteria.push(doc.data().text);
    });

    console.log(`📋 Found ${existingCriteria.length} existing success criteria`);

    const allCriteria = [
        "Deploy Identity Security Insights collectors",
        "Connect to Active Directory for account discovery",
        "Configure cloud identity connectors (if applicable)",
        "Generate privileged account inventory report",
        "Demonstrate attack path visualization",
        "Review AD security posture findings"
    ];

    // Add missing criteria
    let added = 0;
    for (const criteriaText of allCriteria) {
        if (!existingCriteria.includes(criteriaText)) {
            await addDoc(collection(db, SUCCESS_CRITERIA_COLLECTION), {
                solutionId: isiSolutionId,
                text: criteriaText,
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp()
            });
            console.log(`   ✓ Added: ${criteriaText}`);
            added++;
        }
    }

    if (added === 0) {
        console.log('✅ All success criteria already exist!');
    } else {
        console.log(`\n✅ Added ${added} missing success criteria`);
    }

    process.exit(0);
}

addMissingCriteria().catch((error) => {
    console.error('❌ Error:', error);
    process.exit(1);
});
