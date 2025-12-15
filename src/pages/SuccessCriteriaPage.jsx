import { useState, useEffect } from 'react';
import { getAllSolutions } from '../services/dataService';
import { getAllSuccessCriteria, addSuccessCriteria, updateSuccessCriteria, deleteSuccessCriteria } from '../services/dataService';
import PageHeader from '../components/common/PageHeader';
import StatusMessage from '../components/common/StatusMessage';
import './ManagementPage.css';

function SuccessCriteriaPage() {
    const [criteria, setCriteria] = useState([]);
    const [solutions, setSolutions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    const [formData, setFormData] = useState({ text: '', solutionId: '' });
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState(null);
    const [filterSolution, setFilterSolution] = useState('');

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        const [criteriaResult, solutionsResult] = await Promise.all([
            getAllSuccessCriteria(),
            getAllSolutions()
        ]);

        if (criteriaResult.success) {
            setCriteria(criteriaResult.successCriteria);
        }
        if (solutionsResult.success) {
            setSolutions(solutionsResult.solutions);
        }
        setLoading(false);
    };

    const getSolutionName = (solutionId) => {
        const solution = solutions.find(s => s.id === solutionId);
        return solution ? solution.name : 'Unknown';
    };

    const getSolutionIcon = (solutionId) => {
        const solution = solutions.find(s => s.id === solutionId);
        return solution ? solution.icon : '✅';
    };

    const filteredCriteria = filterSolution
        ? criteria.filter(c => c.solutionId === filterSolution)
        : criteria;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        setMessage(null);

        let result;
        if (editingItem) {
            result = await updateSuccessCriteria(editingItem.id, formData);
        } else {
            result = await addSuccessCriteria(formData);
        }

        if (result.success) {
            setMessage({ type: 'success', text: editingItem ? 'Success criteria updated!' : 'Success criteria added!' });
            setShowModal(false);
            setEditingItem(null);
            setFormData({ text: '', solutionId: '' });
            loadData();
        } else {
            setMessage({ type: 'error', text: result.error || 'Operation failed' });
        }
        setSaving(false);
    };

    const handleEdit = (item) => {
        setEditingItem(item);
        setFormData({ text: item.text, solutionId: item.solutionId });
        setShowModal(true);
    };

    const handleDelete = async (item) => {
        if (window.confirm(`Are you sure you want to delete this success criteria?`)) {
            const result = await deleteSuccessCriteria(item.id);
            if (result.success) {
                setMessage({ type: 'success', text: 'Success criteria deleted!' });
                loadData();
            } else {
                setMessage({ type: 'error', text: 'Failed to delete success criteria' });
            }
        }
    };

    const openAddModal = () => {
        setEditingItem(null);
        setFormData({ text: '', solutionId: solutions[0]?.id || '' });
        setShowModal(true);
    };

    return (
        <div className="management-page">
            <PageHeader
                icon="✅"
                title="Success Criteria Management"
                description="Define success criteria milestones for each solution."
                actions={
                    <button className="btn btn-primary" onClick={openAddModal} disabled={solutions.length === 0}>
                        <span>+</span> Add Criteria
                    </button>
                }
            />

            <StatusMessage type={message?.type} text={message?.text} />

            {solutions.length > 0 && (
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
            )}

            {loading ? (
                <div className="loading-state">
                    <div className="spinner"></div>
                    <p>Loading success criteria...</p>
                </div>
            ) : solutions.length === 0 ? (
                <div className="empty-state glass-card">
                    <div className="empty-icon">⚠️</div>
                    <h3>No Solutions Available</h3>
                    <p>You need to add solutions first before creating success criteria.</p>
                </div>
            ) : filteredCriteria.length === 0 ? (
                <div className="empty-state glass-card">
                    <div className="empty-icon">✅</div>
                    <h3>No Success Criteria Yet</h3>
                    <p>Define success criteria to measure POC outcomes.</p>
                    <button className="btn btn-primary" onClick={openAddModal}>Add Success Criteria</button>
                </div>
            ) : (
                <div className="items-list">
                    {filteredCriteria.map((item) => (
                        <div key={item.id} className="list-item glass-card">
                            <div className="list-item-icon">{getSolutionIcon(item.solutionId)}</div>
                            <div className="list-item-content">
                                <p className="list-item-text">{item.text}</p>
                                <span className="list-item-meta">{getSolutionName(item.solutionId)}</span>
                            </div>
                            <div className="item-actions">
                                <button className="btn btn-ghost" onClick={() => handleEdit(item)}>
                                    ✏️
                                </button>
                                <button className="btn btn-ghost btn-danger" onClick={() => handleDelete(item)}>
                                    🗑️
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {showModal && (
                <div className="modal-overlay" onClick={() => setShowModal(false)}>
                    <div className="modal glass-card" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>{editingItem ? 'Edit Success Criteria' : 'Add Success Criteria'}</h2>
                            <button className="close-btn" onClick={() => setShowModal(false)}>×</button>
                        </div>
                        <form onSubmit={handleSubmit}>
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
                            <div className="form-group">
                                <label>Success Criteria</label>
                                <textarea
                                    value={formData.text}
                                    onChange={(e) => setFormData({ ...formData, text: e.target.value })}
                                    placeholder="e.g., Successfully deploy appliance in customer environment..."
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

export default SuccessCriteriaPage;
