import { useState } from 'react';
import solutionsData from '../data/solutions.json';
import { savePocPlan, formatPlanForSave } from '../services/pocPlanService';

function DocumentGenerator({
    solutions,
    selectedUseCases,
    customUseCases,
    customerInfo,
    onCustomerInfoChange
}) {
    const [activeTab, setActiveTab] = useState('prereqs');
    const [isSaving, setIsSaving] = useState(false);
    const [saveMessage, setSaveMessage] = useState(null);
    const { successCriteriaTemplates } = solutionsData;

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

        if (activeTab === 'prereqs') {
            content += `PRE-REQUISITES DOCUMENT\n`;
            content += `========================\n\n`;

            if (customerInfo.companyName) {
                content += `Customer: ${customerInfo.companyName}\n`;
                content += `Contact: ${customerInfo.contactName} (${customerInfo.contactEmail})\n`;
                content += `SE: ${customerInfo.seName}\n\n`;
            }

            solutions.forEach(solution => {
                content += `\n${solution.name}\n`;
                content += '-'.repeat(solution.name.length) + '\n';
                solution.prereqs.forEach(prereq => {
                    content += `• ${prereq}\n`;
                });
            });
        } else {
            content += `MUTUAL POC SUCCESS PLAN\n`;
            content += `========================\n\n`;

            if (customerInfo.companyName) {
                content += `Customer: ${customerInfo.companyName}\n`;
                content += `POC Period: ${customerInfo.pocStartDate} to ${customerInfo.pocEndDate}\n\n`;
            }

            solutions.forEach(solution => {
                const { selected, custom } = getSelectedUseCasesForSolution(solution);
                content += `\n${solution.name}\n`;
                content += '-'.repeat(solution.name.length) + '\n';

                content += '\nUse Cases:\n';
                selected.forEach(uc => {
                    content += `• ${uc.text}\n`;
                });
                if (custom) {
                    content += `• ${custom}\n`;
                }

                content += '\nSuccess Criteria:\n';
                const criteria = successCriteriaTemplates[solution.id] || [];
                criteria.forEach(c => {
                    content += `[ ] ${c}\n`;
                });
            });
        }

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
                        <label>Customer Contact</label>
                        <input
                            type="text"
                            value={customerInfo.contactName}
                            onChange={(e) => handleInputChange('contactName', e.target.value)}
                            placeholder="John Smith"
                        />
                    </div>

                    <div className="form-group">
                        <label>Contact Email</label>
                        <input
                            type="email"
                            value={customerInfo.contactEmail}
                            onChange={(e) => handleInputChange('contactEmail', e.target.value)}
                            placeholder="john.smith@acme.com"
                        />
                    </div>

                    <div className="form-group">
                        <label>SE Name</label>
                        <input
                            type="text"
                            value={customerInfo.seName}
                            onChange={(e) => handleInputChange('seName', e.target.value)}
                            placeholder="Your Name"
                        />
                    </div>

                    <div className="form-group">
                        <label>POC Start Date</label>
                        <input
                            type="date"
                            value={customerInfo.pocStartDate}
                            onChange={(e) => handleInputChange('pocStartDate', e.target.value)}
                        />
                    </div>

                    <div className="form-group">
                        <label>POC End Date</label>
                        <input
                            type="date"
                            value={customerInfo.pocEndDate}
                            onChange={(e) => handleInputChange('pocEndDate', e.target.value)}
                        />
                    </div>
                </div>

                <div className="glass-card document-preview">
                    <div className="document-tabs">
                        <button
                            className={`tab-button ${activeTab === 'prereqs' ? 'active' : ''}`}
                            onClick={() => setActiveTab('prereqs')}
                        >
                            Pre-requisites
                        </button>
                        <button
                            className={`tab-button ${activeTab === 'success' ? 'active' : ''}`}
                            onClick={() => setActiveTab('success')}
                        >
                            Success Plan
                        </button>
                    </div>

                    <div className="document-content">
                        {activeTab === 'prereqs' ? (
                            <PrereqsDocument
                                solutions={solutions}
                                customerInfo={customerInfo}
                            />
                        ) : (
                            <SuccessPlanDocument
                                solutions={solutions}
                                selectedUseCases={selectedUseCases}
                                customUseCases={customUseCases}
                                customerInfo={customerInfo}
                                successCriteriaTemplates={successCriteriaTemplates}
                            />
                        )}
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

function PrereqsDocument({ solutions, customerInfo }) {
    return (
        <div className="prereqs-document">
            <div className="document-header">
                <h2>Technical Pre-requisites</h2>
                {customerInfo.companyName && (
                    <p className="document-meta">
                        Prepared for: <strong>{customerInfo.companyName}</strong>
                    </p>
                )}
            </div>

            {solutions.map(solution => (
                <div key={solution.id} className="prereqs-section">
                    <h4>
                        <span>{solution.icon}</span>
                        {solution.name}
                    </h4>
                    <ul className="prereqs-list">
                        {solution.prereqs.map((prereq, index) => (
                            <li key={index}>{prereq}</li>
                        ))}
                    </ul>
                </div>
            ))}
        </div>
    );
}

function SuccessPlanDocument({
    solutions,
    selectedUseCases,
    customUseCases,
    customerInfo,
    successCriteriaTemplates
}) {
    const getSelectedUseCasesForSolution = (solution) => {
        const selectedIds = selectedUseCases[solution.id] || [];
        return solution.useCases.filter(uc => selectedIds.includes(uc.id));
    };

    return (
        <div className="success-plan-document">
            <div className="document-header">
                <h2>Mutual POC Success Plan</h2>
                {customerInfo.companyName && (
                    <p className="document-meta">
                        <strong>{customerInfo.companyName}</strong>
                        {customerInfo.pocStartDate && customerInfo.pocEndDate && (
                            <span> | POC Period: {customerInfo.pocStartDate} to {customerInfo.pocEndDate}</span>
                        )}
                    </p>
                )}
            </div>

            {solutions.map(solution => {
                const selected = getSelectedUseCasesForSolution(solution);
                const custom = customUseCases[solution.id];
                const criteria = successCriteriaTemplates[solution.id] || [];

                return (
                    <div key={solution.id} className="success-plan-section">
                        <h4>
                            <span>{solution.icon}</span>
                            {solution.name}
                        </h4>

                        <h5>Selected Use Cases</h5>
                        <ul className="prereqs-list">
                            {selected.map(uc => (
                                <li key={uc.id}>{uc.text}</li>
                            ))}
                            {custom && <li><em>{custom}</em></li>}
                        </ul>

                        <h5>Success Criteria</h5>
                        <table className="success-plan-table">
                            <thead>
                                <tr>
                                    <th>Milestone</th>
                                    <th>Owner</th>
                                    <th>Target Date</th>
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {criteria.map((criterion, index) => (
                                    <tr key={index}>
                                        <td>{criterion}</td>
                                        <td>—</td>
                                        <td>—</td>
                                        <td><span className="status-badge status-pending">Pending</span></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                );
            })}
        </div>
    );
}

export default DocumentGenerator;
