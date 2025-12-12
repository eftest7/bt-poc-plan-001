import { useState } from 'react';
import { savePocPlan, formatPlanForSave } from '../services/pocPlanService';

function DocumentGenerator({
    solutions,
    selectedUseCases,
    customUseCases,
    customerInfo,
    onCustomerInfoChange
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
        content += `POC PLAN\n`;
        content += `========\n\n`;

        if (customerInfo.companyName) {
            content += `Customer: ${customerInfo.companyName}\n`;
            if (customerInfo.pocStartDate) {
                content += `Date: ${customerInfo.pocStartDate}\n`;
            }
            content += `\n`;
        }

        solutions.forEach(solution => {
            const { selected, custom } = getSelectedUseCasesForSolution(solution);

            content += `\n${solution.name}\n`;
            content += '='.repeat(solution.name.length) + '\n\n';

            // Pre-requisites section
            content += 'Technical Pre-requisites:\n';
            (solution.solutionPrereqs || solution.prereqs || []).forEach(prereq => {
                content += `  • ${prereq}\n`;
            });

            // Success criteria section
            content += '\nSuccess Criteria:\n';
            if (selected.length === 0 && !custom) {
                content += '  (No success criteria defined - select use cases to define success criteria)\n';
            } else {
                content += `  ${'Milestone'.padEnd(50)} | Owner | Target Date | Status\n`;
                content += `  ${'-'.repeat(50)}-|-------|-------------|--------\n`;
                selected.forEach(uc => {
                    const milestone = uc.text.length > 48 ? uc.text.substring(0, 47) + '…' : uc.text.padEnd(50);
                    content += `  [ ] ${milestone} | —     | —           | Pending\n`;
                });
                if (custom) {
                    const milestone = custom.length > 48 ? custom.substring(0, 47) + '…' : custom.padEnd(50);
                    content += `  [ ] ${milestone} | —     | —           | Pending\n`;
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
                        <button
                            className="btn btn-primary"
                            onClick={handleSave}
                            disabled={isSaving}
                        >
                            {isSaving ? '💾 Saving...' : '💾 Save to Cloud'}
                        </button>
                        <button className="btn btn-secondary" onClick={handleCopyToClipboard}>
                            📋 Copy to Clipboard
                        </button>
                        <button className="btn btn-secondary" onClick={handlePrint}>
                            🖨️ Print / Save PDF
                        </button>
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
                <h2>POC Plan</h2>
                {customerInfo.companyName && (
                    <p className="document-meta">
                        <strong>{customerInfo.companyName}</strong>
                        {customerInfo.pocStartDate && (
                            <span> | Date: {customerInfo.pocStartDate}</span>
                        )}
                    </p>
                )}
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
                                        <li key={index}>{prereq}</li>
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
                                    <table className="success-plan-table">
                                        <thead>
                                            <tr>
                                                <th>Milestone</th>
                                                <th>Prerequisites</th>
                                                <th>Owner</th>
                                                <th>Target Date</th>
                                                <th>Status</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {selected.map((uc) => (
                                                <tr key={uc.id}>
                                                    <td>{uc.text}</td>
                                                    <td>
                                                        {uc.prerequisites && uc.prerequisites.length > 0 ? (
                                                            <ul style={{ margin: 0, paddingLeft: '1.2rem', fontSize: '0.9em' }}>
                                                                {uc.prerequisites.map((prereq, idx) => (
                                                                    <li key={idx}>{prereq}</li>
                                                                ))}
                                                            </ul>
                                                        ) : (
                                                            '—'
                                                        )}
                                                    </td>
                                                    <td>—</td>
                                                    <td>—</td>
                                                    <td><span className="status-badge status-pending">Pending</span></td>
                                                </tr>
                                            ))}
                                            {custom && (
                                                <tr>
                                                    <td><em>{custom}</em></td>
                                                    <td>—</td>
                                                    <td>—</td>
                                                    <td>—</td>
                                                    <td><span className="status-badge status-pending">Pending</span></td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
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
