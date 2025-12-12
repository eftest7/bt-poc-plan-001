import './BottomTabs.css';

function BottomTabs({ currentPage, onNavigate }) {
    const navItems = [
        { id: 'planner', label: 'Planner', icon: '📝' },
        { id: 'solutions', label: 'Solutions', icon: '📦' },
        { id: 'usecases', label: 'Use Cases', icon: '🎯' },
        { id: 'prereqs', label: 'Prereqs', icon: '📋' },
        { id: 'dashboard', label: 'Dashboard', icon: '📊' },
    ];

    return (
        <nav className="bottom-tabs">
            <div className="bottom-tabs-container">
                {navItems.map((item) => (
                    <button
                        key={item.id}
                        className={`tab-item ${currentPage === item.id ? 'active' : ''}`}
                        onClick={() => onNavigate(item.id)}
                        aria-label={item.label}
                    >
                        <span className="tab-icon">{item.icon}</span>
                        <span className="tab-label">{item.label}</span>
                    </button>
                ))}
            </div>
        </nav>
    );
}

export default BottomTabs;
