import { useState, useEffect } from 'react';
import { getAllSolutions } from '../services/dataService';
import { getAllUseCases, addUseCase, updateUseCase, deleteUseCase } from '../services/dataService';
import PageHeader from '../components/common/PageHeader';
import SearchBar from '../components/common/SearchBar';
import StatusMessage from '../components/common/StatusMessage';
import './ManagementPage.css';

function UseCasesPage() {
    const [useCases, setUseCases] = useState([]);
    const [solutions, setSolutions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    const [formData, setFormData] = useState({ text: '', solutionId: '' });
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState(null);
    const [filterSolution, setFilterSolution] = useState('');
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        const [useCasesResult, solutionsResult] = await Promise.all([
            getAllUseCases(),
            getAllSolutions()
        ]);

        if (useCasesResult.success) {
            setUseCases(useCasesResult.useCases);
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
        return solution ? solution.icon : '📋';
    };

    let filteredUseCases = filterSolution
        ? useCases.filter(uc => uc.solutionId === filterSolution)
        : useCases;

    if (searchTerm) {
        filteredUseCases = filteredUseCases.filter(uc =>
            uc.text.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        setMessage(null);

        let result;
        if (editingItem) {
            result = await updateUseCase(editingItem.id, formData);
        } else {
            result = await addUseCase(formData);
        }

        if (result.success) {
            setMessage({ type: 'success', text: editingItem ? 'Use case updated!' : 'Use case added!' });
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
        if (window.confirm(`Are you sure you want to delete this use case?`)) {
            const result = await deleteUseCase(item.id);
            if (result.success) {
                setMessage({ type: 'success', text: 'Use case deleted!' });
                loadData();
            } else {
                setMessage({ type: 'error', text: 'Failed to delete use case' });
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
                icon="🎯"
                title="Use Cases Management"
                description="Manage use cases for each solution."
                actions={
                    <button className="btn btn-primary" onClick={openAddModal} disabled={solutions.length === 0}>
                        <span>+</span> Add Use Case
                    </button>
                }
            />

            <StatusMessage type={message?.type} text={message?.text} />

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
                    <SearchBar
                        searchTerm={searchTerm}
                        value={searchTerm}
                        onChange={setSearchTerm}
                        placeholder="Search use cases..."
                        style={{ flex: 1 }}
                    />
                </>
            )}

            {loading ? (
                <div className="loading-state">
                    <div className="spinner"></div>
                    <p>Loading use cases...</p>
                </div>
            ) : solutions.length === 0 ? (
                <div className="empty-state glass-card">
                    <div className="empty-icon">⚠️</div>
                    <h3>No Solutions Available</h3>
                    <p>You need to add solutions first before creating use cases.</p>
                </div>
            ) : filteredUseCases.length === 0 ? (
                <div className="empty-state glass-card">
                    <div className="empty-icon">{searchTerm || filterSolution ? '🔍' : '🎯'}</div>
                    <h3>{searchTerm || filterSolution ? 'No Results Found' : 'No Use Cases Yet'}</h3>
                    <p>{searchTerm || filterSolution ? 'No use cases match your search criteria.' : 'Get started by adding use cases for your solutions.'}</p>
                    {!searchTerm && !filterSolution && <button className="btn btn-primary" onClick={openAddModal}>Add Use Case</button>}
                </div>
            ) : (
                <div className="items-list">
                    {filteredUseCases.map((useCase) => (
                        <div key={useCase.id} className="list-item glass-card">
                            <div className="list-item-icon">{getSolutionIcon(useCase.solutionId)}</div>
                            <div className="list-item-content">
                                <p className="list-item-text">{useCase.text}</p>
                                <span className="list-item-meta">{getSolutionName(useCase.solutionId)}</span>
                            </div>
                            <div className="item-actions">
                                <button className="btn btn-ghost" onClick={() => handleEdit(useCase)}>
                                    ✏️
                                </button>
                                <button className="btn btn-ghost btn-danger" onClick={() => handleDelete(useCase)}>
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
                            <h2>{editingItem ? 'Edit Use Case' : 'Add Use Case'}</h2>
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
                                <label>Use Case Description</label>
                                <textarea
                                    value={formData.text}
                                    onChange={(e) => setFormData({ ...formData, text: e.target.value })}
                                    placeholder="Describe the use case..."
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

export default UseCasesPage;
