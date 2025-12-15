import React from 'react';
import '../../pages/ManagementPage.css'; // Ensure common styles are available

const SearchBar = ({
    placeholder = "Search...",
    value,
    onChange,
    className = "",
    style = {}
}) => {
    return (
        <div className={`filter-bar glass-card ${className}`} style={{ padding: '0.5rem 1rem', ...style }}>
            <label>Search:</label>
            <input
                type="text"
                placeholder={placeholder}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                style={{ flex: 1, border: 'none', background: 'transparent', color: 'var(--text-primary)', outline: 'none' }}
            />
            {value && (
                <button
                    className="clear-search"
                    onClick={() => onChange('')}
                    aria-label="Clear search"
                    style={{ position: 'relative', right: 'auto', top: 'auto', transform: 'none' }}
                >
                    ✕
                </button>
            )}
        </div>
    );
};

export default SearchBar;
