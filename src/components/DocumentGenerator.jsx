import { useState } from 'react';
import { savePocPlan, formatPlanForSave } from '../services/pocPlanService';

function DocumentGenerator({
    solutions,
    selectedUseCases,
    customUseCases,
    customerInfo,
    onCustomerInfoChange,
    onNewPlan
}) {
    const [activeTab, setActiveTab] = useState('combined');
    const [isSaving, setIsSaving] = useState(false);
    const [saveMessage, setSaveMessage] = useState(null);

    const handleInputChange = (field, value) => {
        onCustomerInfoChange({ ...customerInfo, [field]: value });
    };

    const getSelectedUseCasesForSolution = (solution) => {
        const selectedIds = selectedUseCases[solution.id] || [];
        const selected = solution.useCases.filter(uc => selectedIds.includes(uc.id));
        const custom = customUseCases[solution.id];
        return { selected, custom };
    };

    const handlePrint = () => {
        window.print();
    };

    const handleCopyToClipboard = () => {
        const content = generateTextContent();
        navigator.clipboard.writeText(content).then(() => {
            alert('Content copied to clipboard!');
        });
    };

    const generateTextContent = () => {
        let content = '';

        // Combined document
        // Combined document
        if (customerInfo.companyName) {
            content += `${customerInfo.companyName.toUpperCase()}\n`;
        }
        content += `PROOF OF CONCEPT IMPLEMENTATION PLAN\n`;
        content += `====================================\n\n`;

        if (customerInfo.pocStartDate) {
            content += `Date: ${customerInfo.pocStartDate}\n\n`;
        }

        content += `Overview\n`;
        content += `--------\n`;
        content += `To ensure a successful Proof of Concept, please complete the technical pre-requisites and success criteria items outlined below.\n\n`;

        solutions.forEach(solution => {
            const { selected, custom } = getSelectedUseCasesForSolution(solution);

            content += `\n${solution.name}\n`;
            content += '='.repeat(solution.name.length) + '\n\n';

            // Pre-requisites section
            content += 'Technical Pre-requisites:\n';
            (solution.solutionPrereqs || solution.prereqs || []).forEach(prereq => {
                content += `  • ${prereq.text || prereq}\n`;
            });

            // Success criteria section
            content += '\nSuccess Criteria:\n';
            if (selected.length === 0 && !custom) {
                content += '  (No success criteria defined - select use cases to define success criteria)\n';
            } else {
                selected.forEach(uc => {
                    content += `  [ ] ${uc.text}\n`;
                    content += `      Owner: ____________ | Target: ____________ | Status: Pending\n`;
                    if (uc.prerequisites && uc.prerequisites.length > 0) {
                        content += `      Prerequisites:\n`;
                        uc.prerequisites.forEach(p => content += `      - ${p}\n`);
                    }
                    content += `\n`;
                });
                if (custom) {
                    content += `  [ ] ${custom}\n`;
                    content += `      Owner: ____________ | Target: ____________ | Status: Pending\n\n`;
                }
            }
            content += '\n';
        });

        return content;
    };

    const handleSave = async () => {
        setIsSaving(true);
        setSaveMessage(null);

        const planData = formatPlanForSave(
            customerInfo,
            solutions,
            selectedUseCases,
            customUseCases
        );

        const result = await savePocPlan(planData);

        if (result.success) {
            setSaveMessage({ type: 'success', text: `Saved! Plan ID: ${result.id}` });
        } else {
            setSaveMessage({ type: 'error', text: `Failed to save: ${result.error}` });
        }

        setIsSaving(false);
    };

    return (
        <div className="document-generator">
            <div className="section-header">
                <h2>Review & Export</h2>
                <p>Review your POC documents and export them when ready.</p>
            </div>

            <div className="document-container">
                <div className="glass-card customer-info-form">
                    <h3>POC Details</h3>

                    <div className="form-group">
                        <label>Company Name</label>
                        <input
                            type="text"
                            value={customerInfo.companyName}
                            onChange={(e) => handleInputChange('companyName', e.target.value)}
                            placeholder="Acme Corporation"
                        />
                    </div>

                    <div className="form-group">
                        <label>Date</label>
                        <input
                            type="date"
                            value={customerInfo.pocStartDate}
                            onChange={(e) => handleInputChange('pocStartDate', e.target.value)}
                        />
                    </div>
                </div>

                <div className="glass-card document-preview">
                    <div className="document-content">
                        <CombinedDocument
                            solutions={solutions}
                            selectedUseCases={selectedUseCases}
                            customUseCases={customUseCases}
                            customerInfo={customerInfo}
                        />
                    </div>

                    <div className="document-actions">
                        <button className="btn btn-secondary" onClick={handleCopyToClipboard}>
                            📋 Copy to Clipboard
                        </button>
                        {onNewPlan && (
                            <button
                                className="btn btn-secondary"
                                onClick={onNewPlan}
                                style={{ borderColor: 'rgba(239, 68, 68, 0.3)', color: '#fca5a5' }}
                            >
                                Start New Plan 🗑️
                            </button>
                        )}
                    </div>
                    {saveMessage && (
                        <div className={`save-message ${saveMessage.type}`}>
                            {saveMessage.text}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}



function CombinedDocument({
    solutions,
    selectedUseCases,
    customUseCases,
    customerInfo
}) {
    const getSelectedUseCasesForSolution = (solution) => {
        const selectedIds = selectedUseCases[solution.id] || [];
        return solution.useCases.filter(uc => selectedIds.includes(uc.id));
    };

    return (
        <div className="combined-document">
            <div className="document-header">
                {customerInfo.companyName && (
                    <h1 style={{ margin: '0 0 0.5rem 0', fontSize: '2rem', color: 'var(--primary-color)' }}>
                        {customerInfo.companyName}
                    </h1>
                )}
                <h2 style={{ marginTop: 0, fontSize: '1.5rem', opacity: 0.9 }}>Proof of Concept Implementation Plan</h2>
                {customerInfo.pocStartDate && (
                    <p className="document-meta" style={{ marginTop: '0.5rem', color: 'var(--text-secondary)' }}>
                        Date: {customerInfo.pocStartDate}
                    </p>
                )}
            </div>

            <div className="document-overview" style={{ marginBottom: '2rem', paddingBottom: '1rem', borderBottom: '1px solid var(--border-color)' }}>
                <h3>Overview</h3>
                <p>To ensure a successful Proof of Concept, please complete the technical pre-requisites and success criteria items outlined below.</p>
            </div>

            {solutions.length === 0 ? (
                <div className="empty-doc-message" style={{ padding: '1rem', fontStyle: 'italic', opacity: 0.7 }}>
                    Select solutions to generate POC plan.
                </div>
            ) : (
                solutions.map(solution => {
                    const selected = getSelectedUseCasesForSolution(solution);
                    const custom = customUseCases[solution.id];

                    return (
                        <div key={solution.id} className="solution-section">
                            <h3>
                                <span>{solution.icon}</span>
                                {solution.name}
                            </h3>

                            <div className="prereqs-subsection">
                                <h4>Technical Pre-requisites</h4>
                                <ul className="prereqs-list">
                                    {(solution.solutionPrereqs || solution.prereqs || []).map((prereq, index) => (
                                        <li key={index}>{prereq.text || prereq}</li>
                                    ))}
                                </ul>
                            </div>

                            <div className="success-subsection">
                                <h4>Success Criteria</h4>
                                {selected.length === 0 && !custom ? (
                                    <p className="empty-doc-message" style={{ padding: '0.5rem', fontStyle: 'italic', opacity: 0.7 }}>
                                        No success criteria defined - select use cases to define success criteria.
                                    </p>
                                ) : (
                                    <ul className="success-criteria-list" style={{ listStyle: 'none', padding: 0 }}>
                                        {selected.map((uc) => (
                                            <li key={uc.id} style={{ marginBottom: '1.5rem' }}>
                                                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                                                    <span style={{ fontSize: '1.25em', lineHeight: '1.2', color: 'var(--text-secondary)' }}>☐</span>
                                                    <div style={{ flex: 1 }}>
                                                        <div style={{ fontWeight: 600, fontSize: '1.05em', marginBottom: '0.25rem' }}>{uc.text}</div>

                                                        <div style={{ display: 'flex', gap: '1.5rem', fontSize: '0.85em', color: 'var(--text-secondary)', marginBottom: '0.5rem', flexWrap: 'wrap' }}>
                                                            <span>Owner: ____________</span>
                                                            <span>Target: ____________</span>
                                                            <span>Status: Pending</span>
                                                        </div>

                                                        {uc.prerequisites && uc.prerequisites.length > 0 && (
                                                            <div style={{ fontSize: '0.9em', color: 'var(--text-muted)' }}>
                                                                <div style={{ fontStyle: 'italic', marginBottom: '0.25rem' }}>Prerequisites:</div>
                                                                <ul style={{ margin: 0, paddingLeft: '1.25rem' }}>
                                                                    {uc.prerequisites.map((prereq, idx) => (
                                                                        <li key={idx} style={{ marginBottom: '0.125rem' }}>{prereq}</li>
                                                                    ))}
                                                                </ul>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </li>
                                        ))}
                                        {custom && (
                                            <li style={{ marginBottom: '1.5rem' }}>
                                                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                                                    <span style={{ fontSize: '1.25em', lineHeight: '1.2', color: 'var(--text-secondary)' }}>☐</span>
                                                    <div style={{ flex: 1 }}>
                                                        <div style={{ fontWeight: 600, fontSize: '1.05em', marginBottom: '0.25rem' }}>{custom}</div>
                                                        <div style={{ display: 'flex', gap: '1.5rem', fontSize: '0.85em', color: 'var(--text-secondary)' }}>
                                                            <span>Owner: ____________</span>
                                                            <span>Target: ____________</span>
                                                            <span>Status: Pending</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </li>
                                        )}
                                    </ul>
                                )}
                            </div>
                        </div>
                    );
                })
            )}
        </div>
    );
}

export default DocumentGenerator;
