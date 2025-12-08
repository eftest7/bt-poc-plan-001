import {
    collection,
    addDoc,
    getDocs,
    getDoc,
    doc,
    updateDoc,
    deleteDoc,
    query,
    orderBy,
    serverTimestamp
} from 'firebase/firestore';
import { db } from '../firebase';

const POC_PLANS_COLLECTION = 'pocPlans';

/**
 * Save a new POC plan to Firestore
 */
export async function savePocPlan(planData) {
    try {
        const docRef = await addDoc(collection(db, POC_PLANS_COLLECTION), {
            ...planData,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp()
        });
        return { id: docRef.id, success: true };
    } catch (error) {
        console.error('Error saving POC plan:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Get all POC plans from Firestore
 */
export async function getAllPocPlans() {
    try {
        const q = query(
            collection(db, POC_PLANS_COLLECTION),
            orderBy('createdAt', 'desc')
        );
        const querySnapshot = await getDocs(q);
        const plans = [];
        querySnapshot.forEach((doc) => {
            plans.push({ id: doc.id, ...doc.data() });
        });
        return { plans, success: true };
    } catch (error) {
        console.error('Error getting POC plans:', error);
        return { plans: [], success: false, error: error.message };
    }
}

/**
 * Get a single POC plan by ID
 */
export async function getPocPlanById(planId) {
    try {
        const docRef = doc(db, POC_PLANS_COLLECTION, planId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            return { plan: { id: docSnap.id, ...docSnap.data() }, success: true };
        } else {
            return { plan: null, success: false, error: 'Plan not found' };
        }
    } catch (error) {
        console.error('Error getting POC plan:', error);
        return { plan: null, success: false, error: error.message };
    }
}

/**
 * Update an existing POC plan
 */
export async function updatePocPlan(planId, planData) {
    try {
        const docRef = doc(db, POC_PLANS_COLLECTION, planId);
        await updateDoc(docRef, {
            ...planData,
            updatedAt: serverTimestamp()
        });
        return { success: true };
    } catch (error) {
        console.error('Error updating POC plan:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Delete a POC plan
 */
export async function deletePocPlan(planId) {
    try {
        const docRef = doc(db, POC_PLANS_COLLECTION, planId);
        await deleteDoc(docRef);
        return { success: true };
    } catch (error) {
        console.error('Error deleting POC plan:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Format a POC plan for saving to Firestore
 */
export function formatPlanForSave(customerInfo, selectedSolutions, selectedUseCases, customUseCases) {
    return {
        customerInfo,
        solutions: selectedSolutions.map(s => ({
            id: s.id,
            name: s.name
        })),
        selectedUseCases,
        customUseCases,
        status: 'draft'
    };
}
