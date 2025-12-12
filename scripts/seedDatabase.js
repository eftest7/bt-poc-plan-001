// Seed script for Firebase database
// Run this script once to populate the database with initial data
// Usage: node scripts/seedDatabase.js

import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, getDocs, query, orderBy, serverTimestamp } from 'firebase/firestore';
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

// Collection names
const SOLUTIONS_COLLECTION = 'solutions';
const USE_CASES_COLLECTION = 'useCases';
const PREREQS_COLLECTION = 'solutionPrerequisites';
const SUCCESS_CRITERIA_COLLECTION = 'successCriteria';

// Seed data
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
        "Secure vendor access to internal systems",
        "IT help desk remote support",
        "Session recording and auditing",
        "Credential injection without exposure",
        "Jump host replacement",
        "Multi-cloud infrastructure access"
    ],
    "Remote Support (RS)": [
        "End-user desktop support",
        "Unattended access to servers and workstations",
        "Cross-platform support (Windows, Mac, Linux)",
        "Mobile device support",
        "Integration with ITSM tools (ServiceNow, Jira)",
        "Co-browsing for web application support"
    ],
    "Endpoint Privilege Management for Windows": [
        "Remove local admin rights from end users",
        "Application elevation with policy-based approval",
        "Just-in-time privilege elevation",
        "Self-service elevation with business justification",
        "Trusted application lists (whitelisting)",
        "PowerShell and script control"
    ],
    "Endpoint Privilege Management for Mac": [
        "Remove local admin rights from Mac users",
        "Application elevation on macOS",
        "sudo command control and elevation",
        "Preference pane and system extension management",
        "Integration with Jamf or other MDM"
    ],
    "Password Safe": [
        "Automated password rotation for service accounts",
        "Privileged session recording and keystroke logging",
        "SSH key management",
        "Application-to-application password management (A2A)",
        "Secrets management for DevOps pipelines",
        "Just-in-time access workflows with approvals",
        "Discovery of privileged accounts across the network"
    ],
    "Identity Security Insights": [
        "Privileged account discovery and inventory",
        "Identity attack path analysis",
        "Active Directory security posture assessment",
        "Cloud identity risk visibility (Azure AD, AWS IAM)",
        "Continuous compliance monitoring"
    ]
};

const prereqsMap = {
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

const successCriteriaMap = {
    "Privileged Remote Access (PRA)": [
        "Successfully deploy PRA appliance in customer environment",
        "Configure authentication integration (AD/LDAP/SAML)",
        "Create vault credentials for target systems",
        "Demonstrate secure vendor access workflow",
        "Validate session recording and playback",
        "Test credential injection for RDP/SSH sessions"
    ],
    "Remote Support (RS)": [
        "Deploy Remote Support infrastructure (cloud or on-prem)",
        "Install representative console on support agent machines",
        "Conduct attended support session with end-user",
        "Deploy Jump Client for unattended access",
        "Validate session recording and reporting",
        "Test ITSM integration (if applicable)"
    ],
    "Endpoint Privilege Management for Windows": [
        "Deploy EPM agent to pilot group of Windows endpoints",
        "Create baseline policy for standard applications",
        "Remove local admin rights from test users",
        "Test application elevation workflows",
        "Validate audit logging and reporting",
        "Demonstrate self-service elevation with justification"
    ],
    "Endpoint Privilege Management for Mac": [
        "Deploy EPM agent to pilot group of Mac endpoints via MDM",
        "Configure PPPC and other required permissions",
        "Create baseline policy for macOS applications",
        "Test application and sudo elevation",
        "Remove admin rights from test Mac users",
        "Validate policy enforcement and reporting"
    ],
    "Password Safe": [
        "Deploy Password Safe appliance",
        "Onboard test set of managed accounts",
        "Configure password rotation policy",
        "Demonstrate privileged session launch with recording",
        "Test access request and approval workflow",
        "Validate API access for secrets retrieval (if applicable)"
    ],
    "Identity Security Insights": [
        "Deploy Identity Security Insights collectors",
        "Connect to Active Directory for account discovery",
        "Configure cloud identity connectors (if applicable)",
        "Generate privileged account inventory report",
        "Demonstrate attack path visualization",
        "Review AD security posture findings"
    ]
};

async function checkExistingData() {
    try {
        const q = query(collection(db, SOLUTIONS_COLLECTION), orderBy('name', 'asc'));
        const querySnapshot = await getDocs(q);
        return querySnapshot.size;
    } catch (error) {
        console.error('Error checking existing data:', error);
        return 0;
    }
}

async function seedDatabase() {
    console.log('🌱 Starting database seeding...\n');

    // Check if data already exists
    const existingCount = await checkExistingData();
    if (existingCount > 0) {
        console.log(`⚠️  Database already contains ${existingCount} solutions. Skipping seed.`);
        console.log('   To re-seed, delete the existing data first.\n');
        process.exit(0);
    }

    let totalSolutions = 0;
    let totalUseCases = 0;
    let totalPrereqs = 0;
    let totalCriteria = 0;

    try {
        // Add solutions
        for (const solution of initialSolutions) {
            console.log(`📦 Adding solution: ${solution.name}`);

            const docRef = await addDoc(collection(db, SOLUTIONS_COLLECTION), {
                ...solution,
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp()
            });
            totalSolutions++;

            const solutionId = docRef.id;

            // Add use cases for this solution
            const useCases = useCasesMap[solution.name] || [];
            for (const ucText of useCases) {
                await addDoc(collection(db, USE_CASES_COLLECTION), {
                    solutionId,
                    text: ucText,
                    createdAt: serverTimestamp(),
                    updatedAt: serverTimestamp()
                });
                totalUseCases++;
            }
            console.log(`   ✓ Added ${useCases.length} use cases`);

            // Add prereqs for this solution
            const prereqs = prereqsMap[solution.name] || [];
            for (const prereqText of prereqs) {
                await addDoc(collection(db, PREREQS_COLLECTION), {
                    solutionId,
                    text: prereqText,
                    createdAt: serverTimestamp(),
                    updatedAt: serverTimestamp()
                });
                totalPrereqs++;
            }
            console.log(`   ✓ Added ${prereqs.length} prerequisites`);

            // Add success criteria for this solution
            const criteria = successCriteriaMap[solution.name] || [];
            for (const criteriaText of criteria) {
                await addDoc(collection(db, SUCCESS_CRITERIA_COLLECTION), {
                    solutionId,
                    text: criteriaText,
                    createdAt: serverTimestamp(),
                    updatedAt: serverTimestamp()
                });
                totalCriteria++;
            }
            console.log(`   ✓ Added ${criteria.length} success criteria\n`);
        }

        console.log('✅ Database seeding completed successfully!\n');
        console.log('📊 Summary:');
        console.log(`   • ${totalSolutions} solutions`);
        console.log(`   • ${totalUseCases} use cases`);
        console.log(`   • ${totalPrereqs} prerequisites`);
        console.log(`   • ${totalCriteria} success criteria\n`);

        process.exit(0);
    } catch (error) {
        console.error('❌ Error seeding database:', error);
        process.exit(1);
    }
}

// Run the seeding
seedDatabase();
