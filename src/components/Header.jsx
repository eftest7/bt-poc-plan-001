import { useState } from 'react';
import './Header.css';

function Header({ currentPage, onNavigate }) {
    const [menuOpen, setMenuOpen] = useState(false);

    const navItems = [
        { id: 'planner', label: 'Build a POC Plan', icon: '📝' },
        { id: 'solutions', label: 'Solutions', icon: '📦' },
        { id: 'usecases', label: 'Use Cases', icon: '🎯' },
        { id: 'prereqs', label: 'Prerequisites', icon: '📋' },
    ];

    const handleNavClick = (pageId) => {
        onNavigate(pageId);
        setMenuOpen(false);
    };

    return (
        <header className="header">
            <div className="container header-content">
                <div className="logo" onClick={() => handleNavClick('planner')} style={{ cursor: 'pointer' }}>
                    <span className="logo-icon">🔐</span>
                    <span className="logo-text">BeyondTrust POC Planner</span>
                </div>

                {/* Hamburger Button */}
                <button
                    className={`hamburger ${menuOpen ? 'open' : ''}`}
                    onClick={() => setMenuOpen(!menuOpen)}
                    aria-label="Toggle menu"
                >
                    <span></span>
                    <span></span>
                    <span></span>
                </button>

                {/* Navigation Menu */}
                <nav className={`nav-menu ${menuOpen ? 'open' : ''}`}>
                    <div className="nav-menu-header">
                        <span>Menu</span>
                        <button className="close-menu" onClick={() => setMenuOpen(false)}>×</button>
                    </div>
                    {navItems.map((item) => (
                        <button
                            key={item.id}
                            className={`nav-item ${currentPage === item.id ? 'active' : ''}`}
                            onClick={() => handleNavClick(item.id)}
                        >
                            <span className="nav-icon">{item.icon}</span>
                            <span className="nav-label">{item.label}</span>
                        </button>
                    ))}
                </nav>

                {/* Overlay */}
                {menuOpen && <div className="menu-overlay" onClick={() => setMenuOpen(false)} />}
            </div>
        </header>
    );
}

export default Header;
