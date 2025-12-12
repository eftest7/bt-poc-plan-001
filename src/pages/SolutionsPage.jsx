import { useState, useEffect } from 'react';
import { getAllSolutions, addSolution, updateSolution, deleteSolution, seedInitialData } from '../services/dataService';
import './ManagementPage.css';

const EMOJI_OPTIONS = ['🔐', '🖥️', '🛡️', '🍎', '🔑', '📊', '🌐', '⚙️', '🔧', '📱', '💻', '🔒', '🎯', '📈'];

function SolutionsPage() {
    const [solutions, setSolutions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    const [formData, setFormData] = useState({ name: '', description: '', icon: '🔐' });
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        loadSolutions();
    }, []);

    const loadSolutions = async () => {
        setLoading(true);
        const result = await getAllSolutions();
        if (result.success) {
            setSolutions(result.solutions);
        } else {
            setMessage({ type: 'error', text: 'Failed to load solutions' });
        }
        setLoading(false);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        setMessage(null);

        let result;
        if (editingItem) {
            result = await updateSolution(editingItem.id, formData);
        } else {
            result = await addSolution(formData);
        }

        if (result.success) {
            setMessage({ type: 'success', text: editingItem ? 'Solution updated!' : 'Solution added!' });
            setShowModal(false);
            setEditingItem(null);
            setFormData({ name: '', description: '', icon: '🔐' });
            loadSolutions();
        } else {
            setMessage({ type: 'error', text: result.error || 'Operation failed' });
        }
        setSaving(false);
    };

    const handleEdit = (item) => {
        setEditingItem(item);
        setFormData({ name: item.name, description: item.description, icon: item.icon });
        setShowModal(true);
    };

    const handleDelete = async (item) => {
        if (window.confirm(`Are you sure you want to delete "${item.name}"? This will also delete all associated use cases and prerequisites.`)) {
            const result = await deleteSolution(item.id);
            if (result.success) {
                setMessage({ type: 'success', text: 'Solution deleted!' });
                loadSolutions();
            } else {
                setMessage({ type: 'error', text: 'Failed to delete solution' });
            }
        }
    };

    const openAddModal = () => {
        setEditingItem(null);
        setFormData({ name: '', description: '', icon: '🔐' });
        setShowModal(true);
    };

    const handleSeedData = async () => {
        if (window.confirm('This will populate the database with sample BeyondTrust solutions, use cases, and prerequisites. Continue?')) {
            setLoading(true);
            setMessage(null);
            const result = await seedInitialData();
            if (result.success) {
                setMessage({ type: 'success', text: result.message || 'Sample data loaded successfully!' });
                loadSolutions();
            } else {
                setMessage({ type: 'error', text: result.error || 'Failed to seed data' });
                setLoading(false);
            }
        }
    };

    const filteredSolutions = solutions.filter(solution =>
        solution.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        solution.description.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="management-page">
            <div className="page-header">
                <div className="header-content">
                    <h1><span className="page-icon">📦</span>Solutions Management</h1>
                    <p>Add, edit, or remove BeyondTrust solutions from the database.</p>
                </div>
                <button className="btn btn-primary" onClick={openAddModal}>
                    <span>+</span> Add Solution
                </button>
            </div>

            {message && (
                <div className={`message ${message.type}`}>
                    {message.text}
                </div>
            )}

            {solutions.length > 0 && (
                <div className="filter-bar glass-card">
                    <label>Search:</label>
                    <input
                        type="text"
                        placeholder="Search solutions by name or description..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={{ flex: 1 }}
                    />
                </div>
            )}

            {loading ? (
                <div className="loading-state">
                    <div className="spinner"></div>
                    <p>Loading solutions...</p>
                </div>
            ) : solutions.length === 0 ? (
                <div className="empty-state glass-card">
                    <div className="empty-icon">📦</div>
                    <h3>No Solutions Yet</h3>
                    <p>Get started by adding your first solution or load sample data.</p>
                    <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', marginTop: '1rem' }}>
                        <button className="btn btn-primary" onClick={openAddModal}>Add Solution</button>
                        <button className="btn btn-secondary" onClick={handleSeedData}>Load Sample Data</button>
                    </div>
                </div>
            ) : filteredSolutions.length === 0 ? (
                <div className="empty-state glass-card">
                    <div className="empty-icon">🔍</div>
                    <h3>No Results Found</h3>
                    <p>No solutions match your search criteria.</p>
                </div>
            ) : (
                <div className="items-grid">
                    {filteredSolutions.map((solution) => (
                        <div key={solution.id} className="item-card glass-card">
                            <div className="item-icon">{solution.icon}</div>
                            <div className="item-content">
                                <h3>{solution.name}</h3>
                                <p>{solution.description}</p>
                            </div>
                            <div className="item-actions">
                                <button className="btn btn-ghost" onClick={() => handleEdit(solution)}>
                                    ✏️ Edit
                                </button>
                                <button className="btn btn-ghost btn-danger" onClick={() => handleDelete(solution)}>
                                    🗑️ Delete
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
                            <h2>{editingItem ? 'Edit Solution' : 'Add Solution'}</h2>
                            <button className="close-btn" onClick={() => setShowModal(false)}>×</button>
                        </div>
                        <form onSubmit={handleSubmit}>
                            <div className="form-group">
                                <label>Icon</label>
                                <div className="emoji-picker">
                                    {EMOJI_OPTIONS.map((emoji) => (
                                        <button
                                            key={emoji}
                                            type="button"
                                            className={`emoji-btn ${formData.icon === emoji ? 'selected' : ''}`}
                                            onClick={() => setFormData({ ...formData, icon: emoji })}
                                        >
                                            {emoji}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div className="form-group">
                                <label>Solution Name</label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    placeholder="Enter solution name"
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>Description</label>
                                <textarea
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    placeholder="Enter solution description"
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

export default SolutionsPage;
