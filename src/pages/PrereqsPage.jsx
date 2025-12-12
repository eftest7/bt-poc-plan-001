import { useState, useEffect } from 'react';
import { getAllSolutions, getAllUseCases, getAllSolutionPrereqs, addSolutionPrereq, updateSolutionPrereq, deleteSolutionPrereq } from '../services/dataService';
import './ManagementPage.css';

function PrereqsPage() {
    const [prereqs, setPrereqs] = useState([]);
    const [solutions, setSolutions] = useState([]);
    const [useCases, setUseCases] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    const [formData, setFormData] = useState({ text: '', solutionId: '', useCaseId: '', prereqType: 'solution' });
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState(null);
    const [filterSolution, setFilterSolution] = useState('');
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        const [prereqsResult, solutionsResult, useCasesResult] = await Promise.all([
            getAllSolutionPrereqs(),
            getAllSolutions(),
            getAllUseCases()
        ]);

        if (prereqsResult.success) {
            setPrereqs(prereqsResult.prereqs);
        }
        if (solutionsResult.success) {
            setSolutions(solutionsResult.solutions);
        }
        if (useCasesResult.success) {
            setUseCases(useCasesResult.useCases);
        }
        setLoading(false);
    };

    const getSolutionName = (solutionId) => {
        const solution = solutions.find(s => s.id === solutionId);
        return solution ? solution.name : 'Unknown';
    };

    const getSolutionIcon = (solutionId) => {
        const solution = solutions.find(s => s.id === solutionId);
        return solution ? solution.icon : '📋';
    };

    const getUseCaseName = (useCaseId) => {
        const useCase = useCases.find(uc => uc.id === useCaseId);
        return useCase ? useCase.text : 'Unknown';
    };

    const getUseCaseSolutionId = (useCaseId) => {
        const useCase = useCases.find(uc => uc.id === useCaseId);
        return useCase ? useCase.solutionId : null;
    };

    let filteredPrereqs = filterSolution
        ? prereqs.filter(pr => {
            // Include if prereq is directly for this solution
            if (pr.solutionId === filterSolution) return true;
            // Include if prereq is for a use case belonging to this solution
            if (pr.useCaseId) {
                const useCaseSolutionId = getUseCaseSolutionId(pr.useCaseId);
                return useCaseSolutionId === filterSolution;
            }
            return false;
        })
        : prereqs;

    if (searchTerm) {
        filteredPrereqs = filteredPrereqs.filter(pr =>
            pr.text.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        setMessage(null);

        // Prepare data based on prereq type
        const submitData = { text: formData.text };
        if (formData.prereqType === 'solution') {
            submitData.solutionId = formData.solutionId;
        } else if (formData.prereqType === 'useCase') {
            submitData.useCaseId = formData.useCaseId;
        }

        let result;
        if (editingItem) {
            result = await updateSolutionPrereq(editingItem.id, submitData);
        } else {
            result = await addSolutionPrereq(submitData);
        }

        if (result.success) {
            setMessage({ type: 'success', text: editingItem ? 'Prerequisite updated!' : 'Prerequisite added!' });
            setShowModal(false);
            setEditingItem(null);
            setFormData({ text: '', solutionId: '', useCaseId: '', prereqType: 'solution' });
            loadData();
        } else {
            setMessage({ type: 'error', text: result.error || 'Operation failed' });
        }
        setSaving(false);
    };

    const handleEdit = (item) => {
        setEditingItem(item);
        const prereqType = item.useCaseId ? 'useCase' : 'solution';
        setFormData({
            text: item.text,
            solutionId: item.solutionId || '',
            useCaseId: item.useCaseId || '',
            prereqType
        });
        setShowModal(true);
    };

    const handleDelete = async (item) => {
        if (window.confirm(`Are you sure you want to delete this prerequisite?`)) {
            const result = await deleteSolutionPrereq(item.id);
            if (result.success) {
                setMessage({ type: 'success', text: 'Prerequisite deleted!' });
                loadData();
            } else {
                setMessage({ type: 'error', text: 'Failed to delete prerequisite' });
            }
        }
    };

    const openAddModal = () => {
        setEditingItem(null);
        setFormData({ text: '', solutionId: solutions[0]?.id || '', useCaseId: '', prereqType: 'solution' });
        setShowModal(true);
    };

    return (
        <div className="management-page">
            <div className="page-header">
                <div className="header-content">
                    <h1><span className="page-icon">📋</span>Prerequisites Management</h1>
                    <p>Manage technical prerequisites for each solution.</p>
                </div>
                <button className="btn btn-primary" onClick={openAddModal} disabled={solutions.length === 0}>
                    <span>+</span> Add Prerequisite
                </button>
            </div>

            {message && (
                <div className={`message ${message.type}`}>
                    {message.text}
                </div>
            )}

            {solutions.length > 0 && (
                <>
                    <div className="filter-bar glass-card">
                        <label>Filter by Solution:</label>
                        <select
                            value={filterSolution}
                            onChange={(e) => setFilterSolution(e.target.value)}
                        >
                            <option value="">All Solutions</option>
                            {solutions.map((solution) => (
                                <option key={solution.id} value={solution.id}>
                                    {solution.icon} {solution.name}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className="filter-bar glass-card">
                        <label>Search:</label>
                        <input
                            type="text"
                            placeholder="Search prerequisites..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            style={{ flex: 1 }}
                        />
                    </div>
                </>
            )}

            {loading ? (
                <div className="loading-state">
                    <div className="spinner"></div>
                    <p>Loading prerequisites...</p>
                </div>
            ) : solutions.length === 0 ? (
                <div className="empty-state glass-card">
                    <div className="empty-icon">⚠️</div>
                    <h3>No Solutions Available</h3>
                    <p>You need to add solutions first before creating prerequisites.</p>
                </div>
            ) : filteredPrereqs.length === 0 ? (
                <div className="empty-state glass-card">
                    <div className="empty-icon">{searchTerm || filterSolution ? '🔍' : '📋'}</div>
                    <h3>{searchTerm || filterSolution ? 'No Results Found' : 'No Prerequisites Yet'}</h3>
                    <p>{searchTerm || filterSolution ? 'No prerequisites match your search criteria.' : 'Get started by adding prerequisites for your solutions.'}</p>
                    {!searchTerm && !filterSolution && <button className="btn btn-primary" onClick={openAddModal}>Add Prerequisite</button>}
                </div>
            ) : (
                <div className="items-list">
                    {filteredPrereqs.map((prereq) => {
                        const displaySolutionId = prereq.solutionId || getUseCaseSolutionId(prereq.useCaseId);
                        const displayText = prereq.useCaseId
                            ? `${getSolutionName(displaySolutionId)} → ${getUseCaseName(prereq.useCaseId)}`
                            : getSolutionName(prereq.solutionId);
                        const typeLabel = prereq.useCaseId ? '🎯 Use Case' : '📦 Solution';

                        return (
                            <div key={prereq.id} className="list-item glass-card">
                                <div className="list-item-icon">{getSolutionIcon(displaySolutionId)}</div>
                                <div className="list-item-content">
                                    <p className="list-item-text">{prereq.text}</p>
                                    <span className="list-item-meta">
                                        <span style={{
                                            display: 'inline-block',
                                            backgroundColor: prereq.useCaseId ? 'rgba(99, 102, 241, 0.2)' : 'rgba(59, 130, 246, 0.2)',
                                            padding: '2px 8px',
                                            borderRadius: '4px',
                                            fontSize: '0.75rem',
                                            marginRight: '8px'
                                        }}>
                                            {typeLabel}
                                        </span>
                                        {displayText}
                                    </span>
                                </div>
                                <div className="item-actions">
                                    <button className="btn btn-ghost" onClick={() => handleEdit(prereq)}>
                                        ✏️
                                    </button>
                                    <button className="btn btn-ghost btn-danger" onClick={() => handleDelete(prereq)}>
                                        🗑️
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {showModal && (
                <div className="modal-overlay" onClick={() => setShowModal(false)}>
                    <div className="modal glass-card" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>{editingItem ? 'Edit Prerequisite' : 'Add Prerequisite'}</h2>
                            <button className="close-btn" onClick={() => setShowModal(false)}>×</button>
                        </div>
                        <form onSubmit={handleSubmit}>
                            <div className="form-group">
                                <label>Prerequisite Type</label>
                                <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
                                    <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                                        <input
                                            type="radio"
                                            name="prereqType"
                                            value="solution"
                                            checked={formData.prereqType === 'solution'}
                                            onChange={(e) => setFormData({
                                                ...formData,
                                                prereqType: e.target.value,
                                                useCaseId: ''
                                            })}
                                            style={{ marginRight: '0.5rem' }}
                                        />
                                        📦 Solution-level
                                    </label>
                                    <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                                        <input
                                            type="radio"
                                            name="prereqType"
                                            value="useCase"
                                            checked={formData.prereqType === 'useCase'}
                                            onChange={(e) => setFormData({
                                                ...formData,
                                                prereqType: e.target.value,
                                                solutionId: ''
                                            })}
                                            style={{ marginRight: '0.5rem' }}
                                        />
                                        🎯 Use Case-specific
                                    </label>
                                </div>
                            </div>

                            {formData.prereqType === 'solution' ? (
                                <div className="form-group">
                                    <label>Solution</label>
                                    <select
                                        value={formData.solutionId}
                                        onChange={(e) => setFormData({ ...formData, solutionId: e.target.value })}
                                        required
                                    >
                                        <option value="">Select a solution</option>
                                        {solutions.map((solution) => (
                                            <option key={solution.id} value={solution.id}>
                                                {solution.icon} {solution.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            ) : (
                                <div className="form-group">
                                    <label>Use Case</label>
                                    <select
                                        value={formData.useCaseId}
                                        onChange={(e) => setFormData({ ...formData, useCaseId: e.target.value })}
                                        required
                                    >
                                        <option value="">Select a use case</option>
                                        {solutions.map((solution) => (
                                            <optgroup key={solution.id} label={`${solution.icon} ${solution.name}`}>
                                                {useCases
                                                    .filter(uc => uc.solutionId === solution.id)
                                                    .map((useCase) => (
                                                        <option key={useCase.id} value={useCase.id}>
                                                            {useCase.text}
                                                        </option>
                                                    ))}
                                            </optgroup>
                                        ))}
                                    </select>
                                </div>
                            )}

                            <div className="form-group">
                                <label>Prerequisite Description</label>
                                <textarea
                                    value={formData.text}
                                    onChange={(e) => setFormData({ ...formData, text: e.target.value })}
                                    placeholder="Describe the technical prerequisite..."
                                    rows={3}
                                    required
                                />
                            </div>
                            <div className="modal-actions">
                                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>
                                    Cancel
                                </button>
                                <button type="submit" className="btn btn-primary" disabled={saving}>
                                    {saving ? 'Saving...' : (editingItem ? 'Update' : 'Add')}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

export default PrereqsPage;
