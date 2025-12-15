import { useState, useEffect, useMemo } from 'react';
import { getFullSolutionsData, updateUseCase, updateSolutionPrereq, deleteUseCase, deleteSolutionPrereq } from '../services/dataService';
import PageHeader from '../components/common/PageHeader';
import SearchBar from '../components/common/SearchBar';
import './DashboardPage.css';
import './ManagementPage.css';

function DashboardPage() {
    const [solutions, setSolutions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedSolutions, setSelectedSolutions] = useState([]);
    const [editingItem, setEditingItem] = useState(null);
    const [editText, setEditText] = useState('');
    const [editPrereqs, setEditPrereqs] = useState([]);
    const [saving, setSaving] = useState(false);
    const [expandedSolutions, setExpandedSolutions] = useState({});

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        const result = await getFullSolutionsData();
        if (result.success) {
            setSolutions(result.solutions);
            // By default, select all solutions
            const allIds = result.solutions.map(s => s.id);
            setSelectedSolutions(allIds);
            // Expand all by default
            const initialExpanded = {};
            result.solutions.forEach(s => initialExpanded[s.id] = true);
            setExpandedSolutions(initialExpanded);
        }
        setLoading(false);
    };

    // Toggle solution filter
    const toggleSolutionFilter = (solutionId) => {
        setSelectedSolutions(prev => {
            if (prev.includes(solutionId)) {
                return prev.filter(id => id !== solutionId);
            } else {
                return [...prev, solutionId];
            }
        });
    };

    const toggleAllSolutions = () => {
        if (selectedSolutions.length === solutions.length) {
            setSelectedSolutions([]);
        } else {
            setSelectedSolutions(solutions.map(s => s.id));
        }
    };

    const toggleSolutionExpand = (solutionId) => {
        setExpandedSolutions(prev => ({
            ...prev,
            [solutionId]: !prev[solutionId]
        }));
    };

    // Filter logic
    const filteredGroups = useMemo(() => {
        return solutions.filter(solution => {
            // 1. Must be selected in filter
            if (!selectedSolutions.includes(solution.id)) return false;

            // 2. If search term exists, check if solution or its children match
            if (searchTerm.trim()) {
                const search = searchTerm.toLowerCase();
                const solutionMatch = solution.name.toLowerCase().includes(search);

                const useCasesMatch = (solution.useCases || []).some(uc =>
                    uc.text.toLowerCase().includes(search) ||
                    (uc.prerequisites || []).some(p => p.toLowerCase().includes(search))
                );

                const prereqsMatch = (solution.solutionPrereqs || []).some(p =>
                    p.text.toLowerCase().includes(search)
                );

                return solutionMatch || useCasesMatch || prereqsMatch;
            }

            return true;
        }).map(solution => {
            // Return processed object with only matching children if searching
            // If no search, return all children

            let displayUseCases = solution.useCases || [];
            let displayPrereqs = solution.solutionPrereqs || [];

            if (searchTerm.trim()) {
                const search = searchTerm.toLowerCase();
                // If solution name matches, show all. Otherwise filter children.
                if (!solution.name.toLowerCase().includes(search)) {
                    displayUseCases = displayUseCases.filter(uc =>
                        uc.text.toLowerCase().includes(search) ||
                        (uc.prerequisites || []).some(p => p.toLowerCase().includes(search))
                    );
                    displayPrereqs = displayPrereqs.filter(p =>
                        p.text.toLowerCase().includes(search)
                    );
                }
            }

            return {
                ...solution,
                displayUseCases,
                displayPrereqs
            };
        });
    }, [solutions, selectedSolutions, searchTerm]);

    // Start editing an item
    const handleEditStart = (item, type, parentId) => {
        setEditingItem({ id: item.id, type, parentId }); // parentId is solutionId
        setEditText(item.text);
        if (type === 'usecase') {
            setEditPrereqs(item.prerequisites || []);
        }
    };

    // Cancel editing
    const handleEditCancel = () => {
        setEditingItem(null);
        setEditText('');
        setEditPrereqs([]);
    };

    // Save edited item
    const handleEditSave = async () => {
        if (!editingItem) return;
        if (!editText.trim()) {
            alert('Text cannot be empty');
            return;
        }

        setSaving(true);
        let result;

        if (editingItem.type === 'usecase') {
            result = await updateUseCase(editingItem.id, {
                text: editText,
                prerequisites: editPrereqs,
                solutionId: editingItem.parentId
            });
        } else if (editingItem.type === 'prereq') {
            result = await updateSolutionPrereq(editingItem.id, {
                text: editText,
                solutionId: editingItem.parentId
            });
        }

        if (result.success) {
            await loadData();
            handleEditCancel();
        } else {
            alert('Failed to save: ' + result.error);
        }
        setSaving(false);
    };

    // Delete an item
    const handleDelete = async (item, type) => {
        if (!confirm(`Are you sure you want to delete this ${type === 'usecase' ? 'Use Case' : 'Prerequisite'}?`)) {
            return;
        }

        setSaving(true);
        let result;

        if (type === 'usecase') {
            result = await deleteUseCase(item.id);
        } else if (type === 'prereq') {
            result = await deleteSolutionPrereq(item.id);
        }

        if (result.success) {
            await loadData();
        } else {
            alert('Failed to delete: ' + result.error);
        }
        setSaving(false);
    };

    // Edit form handlers
    const handleAddPrereq = () => setEditPrereqs([...editPrereqs, '']);
    const handlePrereqChange = (index, value) => {
        const newPrereqs = [...editPrereqs];
        newPrereqs[index] = value;
        setEditPrereqs(newPrereqs);
    };
    const handleRemovePrereq = (index) => setEditPrereqs(editPrereqs.filter((_, i) => i !== index));


    if (loading) {
        return <div className="dashboard-page"><div className="loading-state">Loading dashboard data...</div></div>;
    }

    return (
        <div className="dashboard-page">
            <PageHeader
                icon="📊"
                title="Dashboard"
                description="View and analyze all solutions, use cases, and prerequisites"
            />

            {/* Combined Filter Controls */}
            <div className="dashboard-controls-container glass-card">
                <div className="search-row">
                    <SearchBar
                        searchTerm={searchTerm}
                        value={searchTerm}
                        onChange={setSearchTerm}
                        placeholder="Search..."
                        style={{ flex: 1, marginBottom: 0 }}
                    />
                    {searchTerm && (
                        <button className="btn-ghost clear-all-btn" onClick={() => setSearchTerm('')}>
                            Clear Search
                        </button>
                    )}
                </div>

                <div className="filter-chips-row">
                    <span className="filter-label">Filter Solutions:</span>
                    <button
                        className={`filter-chip ${selectedSolutions.length === solutions.length ? 'active' : ''}`}
                        onClick={toggleAllSolutions}
                    >
                        All
                    </button>
                    {solutions.map(solution => (
                        <button
                            key={solution.id}
                            className={`filter-chip ${selectedSolutions.includes(solution.id) ? 'active' : ''}`}
                            onClick={() => toggleSolutionFilter(solution.id)}
                            title={solution.name}
                        >
                            <span className="chip-icon">{solution.icon}</span>
                            <span className="chip-text">{solution.name}</span>
                        </button>
                    ))}
                </div>
            </div>

            {/* Main Content: Grouped by Solution */}
            <div className="grouped-data-list">
                {filteredGroups.length === 0 ? (
                    <div className="empty-state">
                        <div className="empty-icon">📭</div>
                        <p>No solutions match your filters</p>
                    </div>
                ) : (
                    filteredGroups.map(solution => (
                        <div key={solution.id} className="solution-group-card glass-card">
                            {/* Solution Header */}
                            <div className="solution-group-header" onClick={() => toggleSolutionExpand(solution.id)}>
                                <div className="solution-title-row">
                                    <span className="solution-icon-large">{solution.icon}</span>
                                    <h3>{solution.name}</h3>
                                    <div className="solution-badges">
                                        <span className="count-badge prereq-badge">
                                            📋 {solution.displayPrereqs.length} Prereqs
                                        </span>
                                        <span className="count-badge usecase-badge">
                                            🎯 {solution.displayUseCases.length} Use Cases
                                        </span>
                                    </div>
                                </div>
                                <button className="btn-icon expand-btn">
                                    {expandedSolutions[solution.id] ? '▼' : '▶'}
                                </button>
                            </div>

                            {/* Solution Content */}
                            {expandedSolutions[solution.id] && (
                                <div className="solution-group-content fade-in">
                                    {/* 1. Solution Level Prerequisites */}
                                    {solution.displayPrereqs.length > 0 && (
                                        <div className="section-block prereqs-block">
                                            <h4 className="section-title">
                                                <span className="icon">📋</span> {solution.displayPrereqs.length} Solution Prerequisites
                                            </h4>
                                            <div className="prereqs-list-cards">
                                                {solution.displayPrereqs.map((prereq) => (
                                                    <div key={prereq.id} className={`prereq-list-item ${editingItem?.id === prereq.id ? 'editing' : ''}`}>
                                                        {editingItem?.id === prereq.id ? (
                                                            // Edit Form for Prereq
                                                            <div className="edit-form-inline full-width">
                                                                <input
                                                                    className="edit-input-simple"
                                                                    value={editText}
                                                                    onChange={(e) => setEditText(e.target.value)}
                                                                    autoFocus
                                                                />
                                                                <div className="edit-actions-mini">
                                                                    <button className="btn-icon-mini success" onClick={handleEditSave} disabled={saving}>✓</button>
                                                                    <button className="btn-icon-mini cancel" onClick={handleEditCancel} disabled={saving}>✕</button>
                                                                </div>
                                                            </div>
                                                        ) : (
                                                            // Display Mode
                                                            <div className="prereq-content-row">
                                                                <div className="prereq-main-info">
                                                                    <span className="prereq-title-inline">{prereq.text}</span>
                                                                </div>
                                                                <div className="item-actions-vertical">
                                                                    <button className="btn-icon-sm" onClick={() => handleEditStart(prereq, 'prereq', solution.id)} title="Edit">✏️</button>
                                                                    <button className="btn-icon-sm" onClick={() => handleDelete(prereq, 'prereq')} title="Delete">🗑️</button>
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* 2. Use Cases */}
                                    {solution.displayUseCases.length > 0 && (
                                        <div className="section-block usecases-block">
                                            <h4 className="section-title">
                                                <span className="icon">🎯</span> {solution.displayUseCases.length} Use Cases
                                            </h4>
                                            {/* Changed from grid to list */}
                                            <div className="usecases-list">
                                                {solution.displayUseCases.map(useCase => (
                                                    <div key={useCase.id} className={`usecase-list-item ${editingItem?.id === useCase.id ? 'editing' : ''}`}>
                                                        {editingItem?.id === useCase.id ? (
                                                            // Edit Form
                                                            <div className="edit-form-block">
                                                                <div className="form-group">
                                                                    <label>Use Case:</label>
                                                                    <textarea
                                                                        value={editText}
                                                                        onChange={(e) => setEditText(e.target.value)}
                                                                        className="edit-textarea"
                                                                        rows="2"
                                                                        autoFocus
                                                                    />
                                                                </div>
                                                                <div className="form-group">
                                                                    <label>Prerequisites:</label>
                                                                    {editPrereqs.map((prereq, idx) => (
                                                                        <div key={idx} className="prereq-edit-row">
                                                                            <input
                                                                                className="prereq-input"
                                                                                value={prereq}
                                                                                onChange={(e) => handlePrereqChange(idx, e.target.value)}
                                                                            />
                                                                            <button className="remove-btn" onClick={() => handleRemovePrereq(idx)}>×</button>
                                                                        </div>
                                                                    ))}
                                                                    <button className="btn-text" onClick={handleAddPrereq}>+ Add Prerequisite</button>
                                                                </div>
                                                                <div className="edit-actions">
                                                                    <button className="btn btn-primary btn-sm" onClick={handleEditSave} disabled={saving}>Save</button>
                                                                    <button className="btn btn-secondary btn-sm" onClick={handleEditCancel} disabled={saving}>Cancel</button>
                                                                </div>
                                                            </div>
                                                        ) : (
                                                            // Display Mode
                                                            <div className="usecase-content-row">
                                                                <div className="usecase-main-info">
                                                                    <h5 className="usecase-title-inline">{useCase.text}</h5>

                                                                    {(useCase.prerequisites && useCase.prerequisites.length > 0) && (
                                                                        <div className="usecase-prereqs-inline">
                                                                            <span className="prereqs-label">PREREQUISITES:</span>
                                                                            <ul className="inline-prereqs-list">
                                                                                {useCase.prerequisites.map((p, i) => (
                                                                                    <li key={i}>{p}</li>
                                                                                ))}
                                                                            </ul>
                                                                        </div>
                                                                    )}
                                                                </div>

                                                                <div className="item-actions-vertical">
                                                                    <button className="btn-icon-sm" onClick={() => handleEditStart(useCase, 'usecase', solution.id)} title="Edit">✏️</button>
                                                                    <button className="btn-icon-sm" onClick={() => handleDelete(useCase, 'usecase')} title="Delete">🗑️</button>
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {solution.displayPrereqs.length === 0 && solution.displayUseCases.length === 0 && (
                                        <div className="no-data-msg">No visible items for this solution match your filters.</div>
                                    )}
                                </div>
                            )}
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}

export default DashboardPage;
