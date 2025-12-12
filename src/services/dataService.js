import {
    collection,
    addDoc,
    getDocs,
    doc,
    updateDoc,
    deleteDoc,
    query,
    orderBy,
    where,
    serverTimestamp
} from 'firebase/firestore';
import { db } from '../firebase';

// Collection names
const SOLUTIONS_COLLECTION = 'solutions';
const USE_CASES_COLLECTION = 'useCases';
const SOLUTION_PREREQS_COLLECTION = 'solutionPrerequisites';

// ==================== SOLUTIONS ====================

export async function getAllSolutions() {
    try {
        const q = query(
            collection(db, SOLUTIONS_COLLECTION),
            orderBy('name', 'asc')
        );
        const querySnapshot = await getDocs(q);
        const solutions = [];
        querySnapshot.forEach((doc) => {
            solutions.push({ id: doc.id, ...doc.data() });
        });
        return { solutions, success: true };
    } catch (error) {
        console.error('Error getting solutions:', error);
        return { solutions: [], success: false, error: error.message };
    }
}

export async function addSolution(solutionData) {
    try {
        const docRef = await addDoc(collection(db, SOLUTIONS_COLLECTION), {
            ...solutionData,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp()
        });
        return { id: docRef.id, success: true };
    } catch (error) {
        console.error('Error adding solution:', error);
        return { success: false, error: error.message };
    }
}

export async function updateSolution(solutionId, solutionData) {
    try {
        const docRef = doc(db, SOLUTIONS_COLLECTION, solutionId);
        await updateDoc(docRef, {
            ...solutionData,
            updatedAt: serverTimestamp()
        });
        return { success: true };
    } catch (error) {
        console.error('Error updating solution:', error);
        return { success: false, error: error.message };
    }
}

export async function deleteSolution(solutionId) {
    try {
        // Also delete related use cases and solution prereqs
        const useCasesQuery = query(
            collection(db, USE_CASES_COLLECTION),
            where('solutionId', '==', solutionId)
        );
        const prereqsQuery = query(
            collection(db, SOLUTION_PREREQS_COLLECTION),
            where('solutionId', '==', solutionId)
        );

        const [useCasesSnapshot, prereqsSnapshot] = await Promise.all([
            getDocs(useCasesQuery),
            getDocs(prereqsQuery)
        ]);

        // Delete related documents
        const deletePromises = [];
        useCasesSnapshot.forEach((doc) => {
            deletePromises.push(deleteDoc(doc.ref));
        });
        prereqsSnapshot.forEach((doc) => {
            deletePromises.push(deleteDoc(doc.ref));
        });

        await Promise.all(deletePromises);

        // Delete the solution
        const docRef = doc(db, SOLUTIONS_COLLECTION, solutionId);
        await deleteDoc(docRef);
        return { success: true };
    } catch (error) {
        console.error('Error deleting solution:', error);
        return { success: false, error: error.message };
    }
}

// ==================== USE CASES ====================

export async function getAllUseCases() {
    try {
        const q = query(
            collection(db, USE_CASES_COLLECTION),
            orderBy('createdAt', 'desc')
        );
        const querySnapshot = await getDocs(q);
        const useCases = [];
        querySnapshot.forEach((doc) => {
            useCases.push({ id: doc.id, ...doc.data() });
        });
        return { useCases, success: true };
    } catch (error) {
        console.error('Error getting use cases:', error);
        return { useCases: [], success: false, error: error.message };
    }
}

export async function getUseCasesBySolution(solutionId) {
    try {
        const q = query(
            collection(db, USE_CASES_COLLECTION),
            where('solutionId', '==', solutionId),
            orderBy('createdAt', 'desc')
        );
        const querySnapshot = await getDocs(q);
        const useCases = [];
        querySnapshot.forEach((doc) => {
            useCases.push({ id: doc.id, ...doc.data() });
        });
        return { useCases, success: true };
    } catch (error) {
        console.error('Error getting use cases by solution:', error);
        return { useCases: [], success: false, error: error.message };
    }
}

export async function addUseCase(useCaseData) {
    try {
        const docRef = await addDoc(collection(db, USE_CASES_COLLECTION), {
            ...useCaseData,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp()
        });
        return { id: docRef.id, success: true };
    } catch (error) {
        console.error('Error adding use case:', error);
        return { success: false, error: error.message };
    }
}

export async function updateUseCase(useCaseId, useCaseData) {
    try {
        const docRef = doc(db, USE_CASES_COLLECTION, useCaseId);
        await updateDoc(docRef, {
            ...useCaseData,
            updatedAt: serverTimestamp()
        });
        return { success: true };
    } catch (error) {
        console.error('Error updating use case:', error);
        return { success: false, error: error.message };
    }
}

export async function deleteUseCase(useCaseId) {
    try {
        // Delete the use case (prerequisites are now stored within the use case document)
        const docRef = doc(db, USE_CASES_COLLECTION, useCaseId);
        await deleteDoc(docRef);
        return { success: true };
    } catch (error) {
        console.error('Error deleting use case:', error);
        return { success: false, error: error.message };
    }
}

// ==================== SOLUTION PREREQUISITES ====================

export async function getAllSolutionPrereqs() {
    try {
        const q = query(
            collection(db, SOLUTION_PREREQS_COLLECTION),
            orderBy('createdAt', 'desc')
        );
        const querySnapshot = await getDocs(q);
        const prereqs = [];
        querySnapshot.forEach((doc) => {
            prereqs.push({ id: doc.id, ...doc.data() });
        });
        return { prereqs, success: true };
    } catch (error) {
        console.error('Error getting solution prerequisites:', error);
        return { prereqs: [], success: false, error: error.message };
    }
}

export async function getSolutionPrereqsBySolution(solutionId) {
    try {
        const q = query(
            collection(db, SOLUTION_PREREQS_COLLECTION),
            where('solutionId', '==', solutionId),
            orderBy('createdAt', 'desc')
        );
        const querySnapshot = await getDocs(q);
        const prereqs = [];
        querySnapshot.forEach((doc) => {
            prereqs.push({ id: doc.id, ...doc.data() });
        });
        return { prereqs, success: true };
    } catch (error) {
        console.error('Error getting prerequisites by solution:', error);
        return { prereqs: [], success: false, error: error.message };
    }
}

export async function addSolutionPrereq(prereqData) {
    try {
        const docRef = await addDoc(collection(db, SOLUTION_PREREQS_COLLECTION), {
            ...prereqData,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp()
        });
        return { id: docRef.id, success: true };
    } catch (error) {
        console.error('Error adding solution prerequisite:', error);
        return { success: false, error: error.message };
    }
}

export async function updateSolutionPrereq(prereqId, prereqData) {
    try {
        const docRef = doc(db, SOLUTION_PREREQS_COLLECTION, prereqId);
        await updateDoc(docRef, {
            ...prereqData,
            updatedAt: serverTimestamp()
        });
        return { success: true };
    } catch (error) {
        console.error('Error updating solution prerequisite:', error);
        return { success: false, error: error.message };
    }
}

export async function deleteSolutionPrereq(prereqId) {
    try {
        const docRef = doc(db, SOLUTION_PREREQS_COLLECTION, prereqId);
        await deleteDoc(docRef);
        return { success: true };
    } catch (error) {
        console.error('Error deleting solution prerequisite:', error);
        return { success: false, error: error.message };
    }
}

// ==================== SUCCESS CRITERIA ====================
// Success criteria are now represented by use cases themselves
// When a use case is selected, it becomes part of the success criteria

// ==================== COMBINED DATA FOR PLANNER ====================

export async function getFullSolutionsData() {
    try {
        const [solutionsResult, useCasesResult, prereqsResult] = await Promise.all([
            getAllSolutions(),
            getAllUseCases(),
            getAllSolutionPrereqs()
        ]);

        if (!solutionsResult.success || !useCasesResult.success || !prereqsResult.success) {
            throw new Error('Failed to fetch all data');
        }

        console.log('Raw prerequisites from database:', prereqsResult.prereqs);

        // Group use cases and prereqs by solution
        // Use cases ARE the success criteria
        const solutions = solutionsResult.solutions.map(solution => ({
            ...solution,
            useCases: useCasesResult.useCases.filter(uc => uc.solutionId === solution.id),
            // Include both solution-level prereqs AND use-case-level prereqs
            solutionPrereqs: prereqsResult.prereqs
                .filter(pr => pr.solutionId === solution.id ||
                    (pr.useCaseId && useCasesResult.useCases.find(uc => uc.id === pr.useCaseId)?.solutionId === solution.id))
                .map(pr => pr.text),
            prereqs: prereqsResult.prereqs
                .filter(pr => pr.solutionId === solution.id ||
                    (pr.useCaseId && useCasesResult.useCases.find(uc => uc.id === pr.useCaseId)?.solutionId === solution.id))
                .map(pr => pr.text)
        }));

        console.log('Processed solutions with prereqs:', solutions);

        return { solutions, success: true };
    } catch (error) {
        console.error('Error getting full solutions data:', error);
        return { solutions: [], success: false, error: error.message };
    }
}

// ==================== SEED DATA ====================

export async function seedInitialData() {
    const initialSolutions = [
        {
            name: "Privileged Remote Access (PRA)",
            description: "Secure remote access for vendors, IT teams, and service desks without VPN.",
            icon: "🔐"
        },
        {
            name: "Remote Support (RS)",
            description: "Enterprise-grade remote support for IT help desks and customer support teams.",
            icon: "🖥️"
        },
        {
            name: "Endpoint Privilege Management for Windows",
            description: "Remove local admin rights while enabling users to run approved applications.",
            icon: "🛡️"
        },
        {
            name: "Endpoint Privilege Management for Mac",
            description: "Enforce least privilege on macOS devices without hindering productivity.",
            icon: "🍎"
        },
        {
            name: "Password Safe",
            description: "Privileged credential and session management for enterprise environments.",
            icon: "🔑"
        },
        {
            name: "Identity Security Insights",
            description: "Visibility and analytics for identity-related risks across the enterprise.",
            icon: "📊"
        }
    ];

    const useCasesMap = {
        "Privileged Remote Access (PRA)": [
            {
                text: "Secure vendor access to internal systems",
                prerequisites: ["Network access configured for vendor endpoints", "Vault credentials for target systems"]
            },
            {
                text: "IT help desk remote support",
                prerequisites: ["Representative console installed", "Active Directory integration configured"]
            },
            {
                text: "Session recording and auditing",
                prerequisites: ["Storage allocated for session recordings", "Audit policy configured"]
            },
            {
                text: "Credential injection without exposure",
                prerequisites: ["Vault credentials created", "Target systems configured for credential injection"]
            },
            {
                text: "Jump host replacement",
                prerequisites: ["Network access from PRA appliance to target systems", "Jump configurations migrated"]
            },
            {
                text: "Multi-cloud infrastructure access",
                prerequisites: ["Cloud credentials stored in vault", "Cloud network access configured"]
            }
        ],
        "Remote Support (RS)": [
            {
                text: "End-user desktop support",
                prerequisites: ["Representative console installed", "End-user firewall exceptions configured"]
            },
            {
                text: "Unattended access to servers and workstations",
                prerequisites: ["Jump Client deployed", "Unattended access policy configured"]
            },
            {
                text: "Cross-platform support (Windows, Mac, Linux)",
                prerequisites: ["Cross-platform agents tested", "Platform-specific configurations verified"]
            },
            {
                text: "Mobile device support",
                prerequisites: ["Mobile app installed", "Mobile device policies configured"]
            },
            {
                text: "Integration with ITSM tools (ServiceNow, Jira)",
                prerequisites: ["API access configured", "ITSM integration credentials provided"]
            },
            {
                text: "Co-browsing for web application support",
                prerequisites: ["Web application access verified", "Co-browse feature enabled"]
            }
        ],
        "Endpoint Privilege Management for Windows": [
            {
                text: "Remove local admin rights from end users",
                prerequisites: ["EPM agent deployed to pilot group", "Baseline policy created"]
            },
            {
                text: "Application elevation with policy-based approval",
                prerequisites: ["Application whitelist configured", "Approval workflow setup"]
            },
            {
                text: "Just-in-time privilege elevation",
                prerequisites: ["JIT policy configured", "Elevation timeout settings defined"]
            },
            {
                text: "Self-service elevation with business justification",
                prerequisites: ["Self-service portal configured", "Justification requirements defined"]
            },
            {
                text: "Trusted application lists (whitelisting)",
                prerequisites: ["Application inventory completed", "Trust policies defined"]
            },
            {
                text: "PowerShell and script control",
                prerequisites: ["Script execution policies configured", "PowerShell restrictions defined"]
            }
        ],
        "Endpoint Privilege Management for Mac": [
            {
                text: "Remove local admin rights from Mac users",
                prerequisites: ["EPM agent deployed via MDM", "PPPC approvals configured"]
            },
            {
                text: "Application elevation on macOS",
                prerequisites: ["macOS application policies created", "Elevation rules defined"]
            },
            {
                text: "sudo command control and elevation",
                prerequisites: ["sudo policies configured", "Command restrictions defined"]
            },
            {
                text: "Preference pane and system extension management",
                prerequisites: ["System extension policies configured", "Full Disk Access granted"]
            },
            {
                text: "Integration with Jamf or other MDM",
                prerequisites: ["MDM integration configured", "Policy sync verified"]
            }
        ],
        "Password Safe": [
            {
                text: "Automated password rotation for service accounts",
                prerequisites: ["Service accounts identified", "Rotation policies configured"]
            },
            {
                text: "Privileged session recording and keystroke logging",
                prerequisites: ["Storage allocated for recordings", "Recording policies enabled"]
            },
            {
                text: "SSH key management",
                prerequisites: ["SSH keys discovered", "Key rotation policies configured"]
            },
            {
                text: "Application-to-application password management (A2A)",
                prerequisites: ["API access configured", "Application accounts registered"]
            },
            {
                text: "Secrets management for DevOps pipelines",
                prerequisites: ["DevOps integration configured", "Secret retrieval API setup"]
            },
            {
                text: "Just-in-time access workflows with approvals",
                prerequisites: ["Approval workflow configured", "Access policies defined"]
            },
            {
                text: "Discovery of privileged accounts across the network",
                prerequisites: ["Network access configured", "Discovery rules defined"]
            }
        ],
        "Identity Security Insights": [
            {
                text: "Privileged account discovery and inventory",
                prerequisites: ["AD read access granted", "Discovery scope defined"]
            },
            {
                text: "Identity attack path analysis",
                prerequisites: ["Identity data collected", "Attack path rules configured"]
            },
            {
                text: "Active Directory security posture assessment",
                prerequisites: ["AD connector configured", "Assessment baseline defined"]
            },
            {
                text: "Cloud identity risk visibility (Azure AD, AWS IAM)",
                prerequisites: ["Cloud connectors configured", "Cloud read permissions granted"]
            },
            {
                text: "Continuous compliance monitoring",
                prerequisites: ["Compliance rules configured", "Alert forwarding setup"]
            }
        ]
    };

    const solutionPrereqsMap = {
        "Privileged Remote Access (PRA)": [
            "Virtual appliance deployment capability (VMware, Hyper-V, or cloud)",
            "Network access from appliance to target systems (SSH/RDP/VNC ports)",
            "SSL certificate for secure access portal",
            "DNS entry for public/private access URL",
            "Active Directory or LDAP for user authentication (optional but recommended)",
            "Firewall rules to allow outbound HTTPS (443) for cloud services"
        ],
        "Remote Support (RS)": [
            "Cloud-hosted or on-premise appliance deployment",
            "Outbound internet access for cloud relay (if cloud-hosted)",
            "Representative console installation on support agent machines",
            "End-user firewall exceptions for Jump Client (if unattended access)",
            "SAML/SSO integration for single sign-on (optional)",
            "API access for ITSM integrations"
        ],
        "Endpoint Privilege Management for Windows": [
            "Windows endpoints for agent deployment (Windows 10/11, Server 2016+)",
            "Software deployment tool (SCCM, Intune, GPO)",
            "EPM Console/Policy Editor installation",
            "Test group of endpoints for pilot deployment",
            "Admin accounts for policy configuration",
            "Logging/SIEM integration for audit events (optional)"
        ],
        "Endpoint Privilege Management for Mac": [
            "macOS endpoints (macOS 11+) for agent deployment",
            "MDM solution (Jamf Pro, Mosyle, Kandji) for deployment",
            "Apple Business Manager enrollment (recommended)",
            "Test group of Mac devices for pilot",
            "Full Disk Access and other PPPC approvals via MDM"
        ],
        "Password Safe": [
            "Virtual appliance or hardware deployment",
            "Service accounts with permissions to manage target systems",
            "Network access to managed systems (LDAP, WinRM, SSH)",
            "SSL certificate for web portal",
            "Active Directory integration for authentication",
            "Database connectivity for secrets storage",
            "API access for DevOps integrations (optional)"
        ],
        "Identity Security Insights": [
            "Read access to Active Directory",
            "Cloud connector configuration (Azure, AWS, GCP)",
            "Network access from collector to identity sources",
            "Service account with appropriate read permissions",
            "SIEM integration for alert forwarding (optional)"
        ]
    };

    // Success criteria are no longer separate - they are the use cases themselves

    try {
        // Check if data already exists
        const existingSolutions = await getAllSolutions();
        if (existingSolutions.solutions.length > 0) {
            return { success: true, message: 'Data already seeded' };
        }

        // Add solutions
        for (const solution of initialSolutions) {
            const result = await addSolution(solution);
            if (result.success) {
                const solutionId = result.id;

                // Add use cases for this solution (with their prerequisites)
                const useCases = useCasesMap[solution.name] || [];
                for (const useCase of useCases) {
                    await addUseCase({
                        solutionId,
                        text: useCase.text,
                        prerequisites: useCase.prerequisites || []
                    });
                }

                // Add solution-level prereqs
                const solutionPrereqs = solutionPrereqsMap[solution.name] || [];
                for (const prereqText of solutionPrereqs) {
                    await addSolutionPrereq({
                        solutionId,
                        text: prereqText
                    });
                }
            }
        }

        return { success: true, message: 'Data seeded successfully' };
    } catch (error) {
        console.error('Error seeding data:', error);
        return { success: false, error: error.message };
    }
}
