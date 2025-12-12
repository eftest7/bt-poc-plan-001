import { useState, useEffect, useMemo } from 'react';
import { getFullSolutionsData, updateUseCase, updateSolutionPrereq, deleteUseCase, deleteSolutionPrereq } from '../services/dataService';
import './DashboardPage.css';

function DashboardPage() {
    const [solutions, setSolutions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedSolutions, setSelectedSolutions] = useState([]);
    const [viewMode, setViewMode] = useState('all'); // 'all', 'usecases', 'prereqs'
    const [editingItem, setEditingItem] = useState(null);
    const [editText, setEditText] = useState('');
    const [editPrereqs, setEditPrereqs] = useState([]);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        const result = await getFullSolutionsData();
        if (result.success) {
            setSolutions(result.solutions);
            // By default, select all solutions
            setSelectedSolutions(result.solutions.map(s => s.id));
        }
        setLoading(false);
    };

    // Toggle solution filter
    const toggleSolution = (solutionId) => {
        setSelectedSolutions(prev => {
            if (prev.includes(solutionId)) {
                return prev.filter(id => id !== solutionId);
            } else {
                return [...prev, solutionId];
            }
        });
    };

    // Select/Deselect all solutions
    const toggleAllSolutions = () => {
        if (selectedSolutions.length === solutions.length) {
            setSelectedSolutions([]);
        } else {
            setSelectedSolutions(solutions.map(s => s.id));
        }
    };

    // Filter and search logic
    const filteredData = useMemo(() => {
        let items = [];

        solutions.forEach(solution => {
            // Only include if solution is selected
            if (!selectedSolutions.includes(solution.id)) return;

            // Add use cases
            if (viewMode === 'all' || viewMode === 'usecases') {
                (solution.useCases || []).forEach(useCase => {
                    items.push({
                        type: 'usecase',
                        solution: solution.name,
                        solutionIcon: solution.icon,
                        solutionId: solution.id,
                        text: useCase.text,
                        prerequisites: useCase.prerequisites || [],
                        id: useCase.id
                    });
                });
            }

            // Add prerequisites
            if (viewMode === 'all' || viewMode === 'prereqs') {
                (solution.solutionPrereqs || solution.prereqs || []).forEach((prereq, index) => {
                    items.push({
                        type: 'prereq',
                        solution: solution.name,
                        solutionIcon: solution.icon,
                        solutionId: solution.id,
                        text: prereq,
                        id: `${solution.id}-prereq-${index}`
                    });
                });
            }
        });

        // Apply search filter
        if (searchTerm.trim()) {
            const search = searchTerm.toLowerCase();
            items = items.filter(item => {
                const textMatch = item.text.toLowerCase().includes(search);
                const solutionMatch = item.solution.toLowerCase().includes(search);
                const prereqMatch = item.prerequisites?.some(p => p.toLowerCase().includes(search));
                return textMatch || solutionMatch || prereqMatch;
            });
        }

        return items;
    }, [solutions, selectedSolutions, searchTerm, viewMode]);

    // Calculate totals
    const totals = useMemo(() => {
        const useCases = filteredData.filter(item => item.type === 'usecase').length;
        const prereqs = filteredData.filter(item => item.type === 'prereq').length;
        return {
            total: filteredData.length,
            useCases,
            prereqs,
            solutions: selectedSolutions.length
        };
    }, [filteredData, selectedSolutions]);

    // Start editing an item
    const handleEditStart = (item) => {
        setEditingItem(item.id);
        setEditText(item.text);
        if (item.type === 'usecase') {
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
    const handleEditSave = async (item) => {
        if (!editText.trim()) {
            alert('Text cannot be empty');
            return;
        }

        setSaving(true);
        let result;

        if (item.type === 'usecase') {
            result = await updateUseCase(item.id, {
                text: editText,
                prerequisites: editPrereqs,
                solutionId: item.solutionId
            });
        } else {
            // For prerequisites, we need to find the actual prereq ID
            // Since prereqs are stored as an array, we need to handle this differently
            alert('Prerequisite editing is not yet supported due to data structure limitations');
            setSaving(false);
            handleEditCancel();
            return;
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
    const handleDelete = async (item) => {
        if (!confirm(`Are you sure you want to delete this ${item.type}?`)) {
            return;
        }

        setSaving(true);
        let result;

        if (item.type === 'usecase') {
            result = await deleteUseCase(item.id);
        } else {
            alert('Prerequisite deletion is not yet supported due to data structure limitations');
            setSaving(false);
            return;
        }

        if (result.success) {
            await loadData();
        } else {
            alert('Failed to delete: ' + result.error);
        }
        setSaving(false);
    };

    // Add prerequisite to use case being edited
    const handleAddPrereq = () => {
        setEditPrereqs([...editPrereqs, '']);
    };

    // Update a specific prerequisite
    const handlePrereqChange = (index, value) => {
        const newPrereqs = [...editPrereqs];
        newPrereqs[index] = value;
        setEditPrereqs(newPrereqs);
    };

    // Remove a prerequisite
    const handleRemovePrereq = (index) => {
        setEditPrereqs(editPrereqs.filter((_, i) => i !== index));
    };

    if (loading) {
        return (
            <div className="dashboard-page">
                <div className="loading-state">Loading dashboard data...</div>
            </div>
        );
    }

    return (
        <div className="dashboard-page">
            <div className="dashboard-header">
                <h1>📊 Dashboard</h1>
                <p>View and analyze all solutions, use cases, and prerequisites</p>
            </div>

            {/* Stats Overview */}
            <div className="stats-overview">
                <div className="stat-card">
                    <div className="stat-number">{totals.useCases}</div>
                    <div className="stat-label">Use Cases</div>
                </div>
                <div className="stat-card">
                    <div className="stat-number">{totals.prereqs}</div>
                    <div className="stat-label">Prerequisites</div>
                </div>
                <div className="stat-card">
                    <div className="stat-number">{totals.solutions}</div>
                    <div className="stat-label">Solutions</div>
                </div>
            </div>

            {/* Solution Filters - Below Stats */}
            <div className="solution-filters glass-card">
                <div className="filter-header">
                    <h3>Filter by Solution</h3>
                    <button
                        className="toggle-all-btn"
                        onClick={toggleAllSolutions}
                    >
                        {selectedSolutions.length === solutions.length ? 'Deselect All' : 'Select All'}
                    </button>
                </div>
                <div className="solution-filter-list">
                    {solutions.map(solution => {
                        const useCaseCount = solution.useCases?.length || 0;
                        const prereqCount = solution.solutionPrereqs?.length || solution.prereqs?.length || 0;
                        return (
                            <label key={solution.id} className="solution-filter-item">
                                <input
                                    type="checkbox"
                                    checked={selectedSolutions.includes(solution.id)}
                                    onChange={() => toggleSolution(solution.id)}
                                />
                                <span className="solution-icon">{solution.icon}</span>
                                <span className="solution-name">{solution.name}</span>
                                <div className="solution-counts">
                                    <span className="count-badge usecase-badge" title="Use Cases">
                                        🎯 {useCaseCount}
                                    </span>
                                    <span className="count-badge prereq-badge" title="Prerequisites">
                                        📋 {prereqCount}
                                    </span>
                                </div>
                            </label>
                        );
                    })}
                </div>
            </div>

            {/* Search and Filters - Below Top Section */}
            <div className="dashboard-controls">
                <div className="search-box">
                    <span className="search-icon">🔍</span>
                    <input
                        type="text"
                        placeholder="Search use cases, prerequisites, or solutions..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="search-input"
                    />
                    {searchTerm && (
                        <button
                            className="clear-search"
                            onClick={() => setSearchTerm('')}
                            aria-label="Clear search"
                        >
                            ✕
                        </button>
                    )}
                </div>

                <div className="view-mode-selector">
                    <button
                        className={`view-mode-btn ${viewMode === 'all' ? 'active' : ''}`}
                        onClick={() => setViewMode('all')}
                    >
                        All
                    </button>
                    <button
                        className={`view-mode-btn ${viewMode === 'usecases' ? 'active' : ''}`}
                        onClick={() => setViewMode('usecases')}
                    >
                        Use Cases
                    </button>
                    <button
                        className={`view-mode-btn ${viewMode === 'prereqs' ? 'active' : ''}`}
                        onClick={() => setViewMode('prereqs')}
                    >
                        Prerequisites
                    </button>
                </div>
            </div>

            {/* Data List */}
            <div className="data-list glass-card">
                <div className="list-header">
                    <h3>Items ({filteredData.length})</h3>
                </div>

                {filteredData.length === 0 ? (
                    <div className="empty-state">
                        <div className="empty-icon">📭</div>
                        <p>No items found matching your filters</p>
                        {searchTerm && (
                            <button
                                className="btn btn-secondary"
                                onClick={() => setSearchTerm('')}
                            >
                                Clear Search
                            </button>
                        )}
                    </div>
                ) : (
                    <div className="items-list">
                        {filteredData.map(item => (
                            <div key={item.id} className={`list-item ${item.type} ${editingItem === item.id ? 'editing' : ''}`}>
                                {editingItem === item.id ? (
                                    <>
                                        <div className="item-header">
                                            <span className="item-type-badge">
                                                {item.type === 'usecase' ? '🎯 Use Case' : '📋 Prerequisite'}
                                            </span>
                                            <span className="item-solution">
                                                {item.solutionIcon} {item.solution}
                                            </span>
                                        </div>
                                    <div className="edit-form">
                                        <div className="form-group">
                                            <label>
                                                {item.type === 'usecase' ? 'Use Case Text:' : 'Prerequisite Text:'}
                                            </label>
                                            <textarea
                                                value={editText}
                                                onChange={(e) => setEditText(e.target.value)}
                                                className="edit-textarea"
                                                rows="3"
                                                autoFocus
                                            />
                                        </div>

                                        {item.type === 'usecase' && (
                                            <div className="form-group">
                                                <label>Prerequisites:</label>
                                                {editPrereqs.map((prereq, idx) => (
                                                    <div key={idx} className="prereq-edit-row">
                                                        <input
                                                            type="text"
                                                            value={prereq}
                                                            onChange={(e) => handlePrereqChange(idx, e.target.value)}
                                                            className="prereq-input"
                                                            placeholder="Enter prerequisite..."
                                                        />
                                                        <button
                                                            className="btn-icon remove-prereq-btn"
                                                            onClick={() => handleRemovePrereq(idx)}
                                                            title="Remove prerequisite"
                                                        >
                                                            ✕
                                                        </button>
                                                    </div>
                                                ))}
                                                <button
                                                    className="btn btn-secondary btn-sm"
                                                    onClick={handleAddPrereq}
                                                >
                                                    + Add Prerequisite
                                                </button>
                                            </div>
                                        )}

                                        <div className="edit-actions">
                                            <button
                                                className="btn btn-primary"
                                                onClick={() => handleEditSave(item)}
                                                disabled={saving}
                                            >
                                                {saving ? 'Saving...' : '💾 Save'}
                                            </button>
                                            <button
                                                className="btn btn-secondary"
                                                onClick={handleEditCancel}
                                                disabled={saving}
                                            >
                                                Cancel
                                            </button>
                                        </div>
                                    </div>
                                    </>
                                ) : (
                                    <>
                                        <div className="item-content">
                                            <div className="item-header">
                                                <span className="item-type-badge">
                                                    {item.type === 'usecase' ? '🎯 Use Case' : '📋 Prerequisite'}
                                                </span>
                                                <span className="item-solution">
                                                    {item.solutionIcon} {item.solution}
                                                </span>
                                            </div>
                                            <div className="item-text">{item.text}</div>
                                            {item.type === 'usecase' && item.prerequisites && item.prerequisites.length > 0 && (
                                                <div className="item-prerequisites">
                                                    <strong>Prerequisites:</strong>
                                                    <ul>
                                                        {item.prerequisites.map((prereq, idx) => (
                                                            <li key={idx}>{prereq}</li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            )}
                                        </div>
                                        <div className="item-actions">
                                            <button
                                                className="btn-icon edit-btn"
                                                onClick={() => handleEditStart(item)}
                                                title="Edit"
                                                disabled={saving}
                                            >
                                                ✏️
                                            </button>
                                            <button
                                                className="btn-icon delete-btn"
                                                onClick={() => handleDelete(item)}
                                                title="Delete"
                                                disabled={saving}
                                            >
                                                🗑️
                                            </button>
                                        </div>
                                    </>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

export default DashboardPage;
